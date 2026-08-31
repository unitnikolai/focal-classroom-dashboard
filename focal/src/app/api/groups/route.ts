import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

/**
 * GET /api/groups
 * Returns { group_id, group_name } pairs for the caller's own organization.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user's profile server-side to get their org_id
    // Never trust client-supplied org_id (IDOR prevention)
    const profileRes = await fetch(`${LAMBDA_URL}/api/profile`, {
      method: 'GET',
      headers: { cookie: cookieHeader ?? '' },
    });

    if (!profileRes.ok) {
      return NextResponse.json({ error: 'Failed to resolve organization' }, { status: 403 });
    }

    const profileData = await profileRes.json();
    const org_id = profileData.organization_id;
    if (!org_id) {
      return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
    }

    const backendRes = await fetch(
      `${LAMBDA_URL}/groups?org_id=${encodeURIComponent(org_id)}`,
      {
        method: 'GET',
        headers: { cookie: cookieHeader ?? '' },
      }
    );

    const body = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json({ error: body.error ?? 'Backend error' }, { status: backendRes.status });
    }

    return NextResponse.json(body);
  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
