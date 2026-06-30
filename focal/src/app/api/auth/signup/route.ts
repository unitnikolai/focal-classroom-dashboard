import { NextRequest, NextResponse } from "next/server";

const COGNITO_ENDPOINT = process.env.COGNITO_ENDPOINT!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; firstName?: string; lastName?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, firstName, lastName } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const cognitoRes = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
    },
    body: JSON.stringify({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        ...(firstName ? [{ Name: "given_name", Value: firstName }] : []),
        ...(lastName ? [{ Name: "family_name", Value: lastName }] : []),
      ],
    }),
  });

  const data = await cognitoRes.json();

  if (!cognitoRes.ok) {
    const msg =
      data.__type === "UsernameExistsException"
        ? "An account with this email already exists"
        : data.__type === "InvalidPasswordException"
        ? "Password does not meet requirements"
        : data.__type === "InvalidParameterException"
        ? data.message ?? "Invalid parameters"
        : "Sign up failed, please try again";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    confirmed: data.UserConfirmed,
    deliveryMedium: data.CodeDeliveryDetails?.DeliveryMedium,
  });
}
