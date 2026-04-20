const APPSYNC_REALTIME_ENDPOINT = process.env.NEXT_PUBLIC_APPSYNC_REALTIME_ENDPOINT!;
const APPSYNC_ENDPOINT = process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT!;

interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

/**
 * Opens an AppSync real-time WebSocket subscription using the
 * AppSync WebSocket protocol with Cognito auth.
 *
 * Returns an unsubscribe function.
 */
export function subscribeAppSync<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  callbacks: SubscriptionCallbacks<T>,
): () => void {
  let ws: WebSocket | null = null;
  let keepAliveTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const header = btoa(JSON.stringify({
    host: new URL(APPSYNC_ENDPOINT).host,
    Authorization: token,
  }));
  const payload = btoa('{}');

  const url = `${APPSYNC_REALTIME_ENDPOINT}?header=${encodeURIComponent(header)}&payload=${encodeURIComponent(payload)}`;

  ws = new WebSocket(url, ['graphql-ws']);

  ws.onopen = () => {
    ws!.send(JSON.stringify({ type: 'connection_init' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case 'connection_ack': {
        const subscriptionId = crypto.randomUUID();
        ws!.send(JSON.stringify({
          id: subscriptionId,
          type: 'start',
          payload: {
            data: JSON.stringify({ query, variables }),
            extensions: {
              authorization: {
                Authorization: token,
                host: new URL(APPSYNC_ENDPOINT).host,
              },
            },
          },
        }));

        // Set up keep-alive based on connectionTimeoutMs
        const timeoutMs = msg.payload?.connectionTimeoutMs ?? 300000;
        keepAliveTimer = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        }, timeoutMs);
        break;
      }

      case 'data':
        if (msg.payload?.data) {
          const data = msg.payload.data;
          const key = Object.keys(data)[0];
          const value = key ? data[key] : data;
          if (value) {
            callbacks.onData(value);
          }
        }
        break;

      case 'ka':
        // Keep-alive — reset timeout
        if (keepAliveTimer) clearTimeout(keepAliveTimer);
        keepAliveTimer = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        }, 300000);
        break;

      case 'error':
        callbacks.onError?.(msg.payload);
        break;
    }
  };

  ws.onerror = (err) => {
    callbacks.onError?.(err);
  };

  ws.onclose = (event) => {
    if (keepAliveTimer) clearTimeout(keepAliveTimer);
    if (!closed) {
      callbacks.onClose?.();
    }
  };

  // Return unsubscribe function
  return () => {
    closed = true;
    if (keepAliveTimer) clearTimeout(keepAliveTimer);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}
