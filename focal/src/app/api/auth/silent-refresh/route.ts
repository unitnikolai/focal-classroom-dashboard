import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') ?? '/';

  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(`${LAMBDA_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  if (!lambdaRes.ok) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  const safePath =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const res = NextResponse.redirect(new URL(safePath, req.url));

  lambdaRes.headers.getSetCookie().forEach(cookie => {
    res.headers.append("Set-Cookie", cookie);
  });

  return res;
}