import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';
import type { BackendUserProfile, ProfileApiResponse, UserProfile } from '@/types/profile';

const LAMBDA_URL = 'https://4acmiz12d4.execute-api.us-east-2.amazonaws.com';

/**
 * GET /api/profile
 * Validates access token via auth-server, then fetches profile from backend Lambda.
 */
export async function GET(req: NextRequest) {
  try {
    // Validate the access token using the same Cognito verifier as /api/auth/check
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ProfileApiResponse,
        { status: 401 }
      );
    }

    // Forward cookies to the backend Lambda so the oAuth2Authorizer can validate
    const backendRes = await fetch(`${LAMBDA_URL}/user/profile`, {
      method: 'GET',
      headers: {
        cookie: cookieHeader ?? '',
      },
    });

    if (!backendRes.ok) {
      const body = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: body.error ?? 'Backend error' } satisfies ProfileApiResponse,
        { status: backendRes.status }
      );
    }

    const backendData: BackendUserProfile = await backendRes.json();

    const profileData: UserProfile = {
      id: payload.sub,
      personalInfo: {
        givenName: backendData.given_name ?? '',
        lastName: backendData.family_name ?? '',
        email: backendData.email ?? '',
        organizationId: backendData.organization_id ?? '',
      },
    };

    return NextResponse.json({ success: true, data: profileData } satisfies ProfileApiResponse);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' } satisfies ProfileApiResponse,
      { status: 500 }
    );
  }
}
