import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

export async function PATCH(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyText = await req.text();
    const backendRes = await fetch(`${LAMBDA_URL}/admin/users/admin-status`, {
      method: 'PATCH',
      headers: {
        cookie: cookieHeader ?? '',
        'content-type': 'application/json',
        'x-csrf-token': req.headers.get('x-csrf-token') ?? '',
      },
      body: bodyText,
    });

    const body = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json({ error: body.error ?? 'Backend error' }, { status: backendRes.status });
    }
    return NextResponse.json(body);
  } catch (error) {
    console.error('Admin set admin-status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
