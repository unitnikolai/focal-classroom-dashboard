import { NextRequest, NextResponse } from "next/server";

const COGNITO_ENDPOINT = "https://cognito-idp.us-east-2.amazonaws.com/";
const CLIENT_ID = "2qnnauihtehjeifiif9a1qqjmn";

export async function POST(req: NextRequest) {
  let body: { email?: string; code?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, code } = body;

  if (!email || !code) {
    return NextResponse.json({ error: "email and code are required" }, { status: 400 });
  }

  const cognitoRes = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
    },
    body: JSON.stringify({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    }),
  });

  if (!cognitoRes.ok) {
    const data = await cognitoRes.json();
    const msg =
      data.__type === "CodeMismatchException"
        ? "Invalid verification code"
        : data.__type === "ExpiredCodeException"
        ? "Verification code has expired, please request a new one"
        : data.__type === "NotAuthorizedException"
        ? "Account is already confirmed"
        : "Confirmation failed, please try again";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
