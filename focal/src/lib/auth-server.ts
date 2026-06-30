import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cookies } from "next/headers";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export async function getAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  try {
    const payload = await verifier.verify(accessToken);
    return {
      userId: payload.sub,
      email: payload.email as string ?? "",
    };
  } catch {
    return null;
  }
}

export async function verifyAuthCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  const token = match?.[1];
  if (!token) return null;
  try {
    return await verifier.verify(token);
  } catch {
    return null;
  }
}