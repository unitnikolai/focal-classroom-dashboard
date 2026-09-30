import { NextRequest, NextResponse } from 'next/server';
import { forwardSetCookies } from '@/lib/cookies';

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function POST(req: NextRequest) {
  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(`${LAMBDA_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }

  const data = await lambdaRes.json();
  const res = NextResponse.json(data, { status: lambdaRes.status });

  forwardSetCookies(res, lambdaRes.headers.getSetCookie());

  return res;
}