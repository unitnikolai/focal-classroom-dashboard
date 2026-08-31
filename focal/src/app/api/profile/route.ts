import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';
import type { BackendUserProfile, ProfileApiResponse, UserProfile } from '@/types/profile';

const LAMBDA_URL = process.env.LAMBDA_URL!;

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
    const backendRes = await fetch(`${LAMBDA_URL}/api/profile`, {
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
      adminStatus: backendData.admin_status ?? false,
      focalAdmin: backendData.focal_admin ?? false,
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

/**
 * PATCH /api/profile
 * Updates the caller's own given_name/family_name. No other fields are accepted.
 */
export async function PATCH(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { given_name, family_name } = await req.json().catch(() => ({}));
    if (typeof given_name !== 'string' || typeof family_name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'given_name and family_name are required' },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${LAMBDA_URL}/api/profile`, {
      method: 'PATCH',
      headers: {
        cookie: cookieHeader ?? '',
        'content-type': 'application/json',
        'x-csrf-token': req.headers.get('x-csrf-token') ?? '',
      },
      body: JSON.stringify({ given_name, family_name }),
    });

    const body = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json({ success: false, error: body.error ?? 'Backend error' }, { status: backendRes.status });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
