import { NextRequest, NextResponse } from "next/server";

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function POST(req: NextRequest) {
  let body: { email?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const lambdaRes = await fetch(`${LAMBDA_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await lambdaRes.json();
    return NextResponse.json(data, { status: lambdaRes.status });
  } catch (err) {
    console.error("Failed to reach forgot-password Lambda:", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
