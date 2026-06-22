import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = "https://4acmiz12d4.execute-api.us-east-2.amazonaws.com";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  // The one-time value set by /api/auth/oauth/start before redirecting to Cognito.
  const expectedState = req.cookies.get('oauth_state')?.value;

  // Always clear the one-time state cookie, on success or failure.
  const fail = () => {
    const r = NextResponse.redirect(new URL('/signin', req.url));
    r.cookies.delete('oauth_state');
    return r;
  };

  // Reject if code/state are missing or the state doesn't match what this browser
  // started the flow with. This blocks OAuth login CSRF / session fixation: an
  // attacker cannot force a victim's browser to complete a flow it never initiated,
  // nor inject their own authorization code to plant attacker-controlled cookies.
  if (!code || !state || !expectedState || state !== expectedState) {
    return fail();
  }

  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(
      // encodeURIComponent prevents the code value from injecting extra query params.
      `${LAMBDA_URL}/oauth2/callback?code=${encodeURIComponent(code)}`,
      { method: "GET" }
    );
  } catch (err) {
    console.error("Failed to reach callback Lambda");
    return fail();
  }

  // Only relay Set-Cookie if the token exchange actually succeeded.
  if (!lambdaRes.ok) {
    console.error("Callback Lambda returned non-OK status:", lambdaRes.status);
    return fail();
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.delete('oauth_state');

  lambdaRes.headers.getSetCookie().forEach(cookie => {
    res.headers.append("Set-Cookie", cookie);
  });

  return res;
}
