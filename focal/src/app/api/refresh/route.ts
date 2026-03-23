import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = "https://4acmiz12d4.execute-api.us-east-2.amazonaws.com";

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

  lambdaRes.headers.getSetCookie().forEach(cookie => {
    res.headers.append("Set-Cookie", cookie);
  });

  return res;
}