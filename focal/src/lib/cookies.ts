/**
 * Auth cookies are minted by the backend Lambda with the `Secure` attribute,
 * which is correct for the HTTPS production deployment. Locally, however, the
 * dashboard is served over plain HTTP (`next dev` on http://localhost), and
 * browsers refuse to store `Secure` cookies received over an insecure
 * connection. The result: a login succeeds (200) but `accessToken` /
 * `csrfToken` never get saved, every subsequent request is treated as
 * unauthenticated, and the middleware bounces the user back to /signin.
 *
 * To keep local dev working without weakening production, we strip the `Secure`
 * attribute from forwarded Set-Cookie headers only when NOT running in
 * production. Everything else about the cookie (name, value, HttpOnly,
 * SameSite, Path, Max-Age) is preserved.
 */
const STRIP_SECURE = process.env.NODE_ENV !== "production";

/**
 * Returns a Set-Cookie value safe for the current environment: unchanged in
 * production, with a standalone `Secure` attribute removed in dev/test.
 */
export function prepareSetCookie(cookie: string): string {
  if (!STRIP_SECURE) return cookie;
  // Match `; Secure` as its own attribute (case-insensitive), followed by the
  // next attribute separator or the end of the string. This never touches the
  // cookie value or lookalike attributes such as `SameSite`.
  return cookie.replace(/;\s*Secure(?=\s*(?:;|$))/i, "");
}

interface AppendableHeaders {
  headers: { append: (name: string, value: string) => void };
}

/**
 * Appends each backend Set-Cookie header to the outgoing response, sanitized
 * for the current environment via {@link prepareSetCookie}.
 */
export function forwardSetCookies(res: AppendableHeaders, cookies: string[]): void {
  for (const cookie of cookies) {
    res.headers.append("Set-Cookie", prepareSetCookie(cookie));
  }
}
