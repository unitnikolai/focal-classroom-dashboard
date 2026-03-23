import { NextRequest, NextResponse } from 'next/server';
import { CognitoJwtVerifier } from 'aws-jwt-verify';


const COGNITO_CLIENT_ID = "2qnnauihtehjeifiif9a1qqjmn";
const COGNITO_USER_POOL_ID = "us-east-2_enXp5KADX"

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: 'access',
});

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const payload = await verifier.verify(accessToken);
    return NextResponse.json({ authenticated: true, sub: payload.sub });
  } catch (err: any) {
    const expired = err?.name === 'JwtExpiredError';
    return NextResponse.json(
      { error: expired ? 'TOKEN_EXPIRED' : 'Invalid token' },
      { status: 401 }
    );
  }
}