import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = "https://4acmiz12d4.execute-api.us-east-2.amazonaws.com";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(
      `${LAMBDA_URL}/oauth2/callback?code=${code}`,
      { method: "GET" }
    );
  } catch (err) {
    console.error("Failed to reach callback Lambda:", err);
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url));

  lambdaRes.headers.getSetCookie().forEach(cookie => {
    res.headers.append("Set-Cookie", cookie);
  });

  return res;
}