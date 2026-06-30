import { NextRequest, NextResponse } from 'next/server';

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const REDIRECT_URI = process.env.CALLBACK_URL!;

// Initiates the OAuth Authorization Code flow. Generates a one-time `state`,
// stores it in an HttpOnly cookie, and redirects the browser to Cognito with the
// same `state`. The callback (/api/auth/callback) then requires the value echoed
// back by Cognito to match this cookie — defeating login CSRF / session fixation.
export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();

  const authorizeUrl = new URL(`https://${COGNITO_DOMAIN}/oauth2/authorize`);
  authorizeUrl.searchParams.set('client_id', CLIENT_ID);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'openid email profile');
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.set('identity_provider', 'Google');
  authorizeUrl.searchParams.set('state', state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    // Lax (not Strict): the cookie must survive the top-level redirect back from
    // Cognito's domain. Lax is sent on top-level GET navigations; Strict is not.
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes — the flow should complete quickly.
  });
  return res;
}
