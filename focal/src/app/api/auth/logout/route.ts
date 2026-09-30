import { NextResponse } from 'next/server';
import { forwardSetCookies } from '@/lib/cookies';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const clear = 'Max-Age=0; Path=/; Secure; SameSite=Lax';

  // Match the attributes the cookies were set with (Secure is stripped in dev
  // by forwardSetCookies) so the deletions actually take effect over HTTP.
  forwardSetCookies(res, [
    `accessToken=; ${clear}; HttpOnly`,
    `csrfToken=; ${clear}`,
    `refreshToken=; ${clear}; HttpOnly`,
  ]);

  return res;
}