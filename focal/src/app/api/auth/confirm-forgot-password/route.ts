import { NextRequest, NextResponse } from "next/server";

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string; newPassword?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, code, newPassword } = body;

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "email, code, and newPassword are required" },
      { status: 400 }
    );
  }

  try {
    const lambdaRes = await fetch(
      `${LAMBDA_URL}/auth/confirm-forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      }
    );

    const data = await lambdaRes.json();
    return NextResponse.json(data, { status: lambdaRes.status });
  } catch (err) {
    console.error("Failed to reach confirm-forgot-password Lambda:", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
