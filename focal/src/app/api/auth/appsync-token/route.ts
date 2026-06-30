import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie');
  const payload = await verifyAuthCookie(cookieHeader);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = cookieHeader?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1];
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch org_id from profile (server-side, never trust client)
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

  return NextResponse.json({ token: accessToken, org_id });
}
