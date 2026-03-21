export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match?.[1] ?? null;
}

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCsrfToken();

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...init.headers,
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
  });
}