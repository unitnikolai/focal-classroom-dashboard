import { CognitoJwtVerifier } from 'aws-jwt-verify';

export const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-2_enXp5KADX',
  tokenUse: 'access',
  clientId: '2qnnauihtehjeifiif9a1qqjmn',
});

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