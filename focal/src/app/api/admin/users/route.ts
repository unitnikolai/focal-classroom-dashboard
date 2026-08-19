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

    const backendRes = await fetch(`${LAMBDA_URL}/admin/users`, {
      method: 'GET',
      headers: { cookie: cookieHeader ?? '' },
    });

    const body = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json({ error: body.error ?? 'Backend error' }, { status: backendRes.status });
    }
    return NextResponse.json(body);
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyText = await req.text();
    const backendRes = await fetch(`${LAMBDA_URL}/admin/users`, {
      method: 'DELETE',
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
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
