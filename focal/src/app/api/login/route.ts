import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = "https://4acmiz12d4.execute-api.us-east-2.amazonaws.com";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password required" },
      { status: 400 }
    );
  }

  let lambdaRes: Response;
  try {
    lambdaRes = await fetch(`${LAMBDA_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    console.error("Failed to reach login Lambda:", err);
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