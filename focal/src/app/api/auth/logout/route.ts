import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const clear = 'Max-Age=0; Path=/; Secure; SameSite=Lax';

  res.headers.append('Set-Cookie', `accessToken=; ${clear}; HttpOnly`);
  res.headers.append('Set-Cookie', `csrfToken=; ${clear}`);
  res.headers.append('Set-Cookie', `refreshToken=; ${clear}; HttpOnly`);

  return res;
}