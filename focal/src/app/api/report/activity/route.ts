import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

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

    const params = new URLSearchParams({ org_id });
    const start = req.nextUrl.searchParams.get('start');
    const end = req.nextUrl.searchParams.get('end');
    if (start) params.set('start', start);
    if (end) params.set('end', end);

    const backendRes = await fetch(
      `${LAMBDA_URL}/report/activity?${params.toString()}`,
      {
        method: 'GET',
        headers: { cookie: cookieHeader ?? '' },
      }
    );

    if (!backendRes.ok) {
      const body = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: body.error ?? 'Backend error' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Activity report fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
