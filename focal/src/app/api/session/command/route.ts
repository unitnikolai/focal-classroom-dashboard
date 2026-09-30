import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthCookie } from '@/lib/auth-server';

const LAMBDA_URL = process.env.LAMBDA_URL!;

// Commands an admin may issue from the dashboard. The backend enforces its own
// allowlist too; this is a first line of defence at the proxy.
const ALLOWED_COMMANDS = new Set(['unblock']);

/**
 * POST /api/session/command
 * Body: { session_ids: string[], command?: "unblock" }
 *
 * Issues a remote command (default: unblock) to the given device sessions.
 * The org is resolved server-side from the caller's own profile — the client
 * never supplies it — so an admin can only ever command their own org's
 * devices (IDOR prevention, matching /api/session/pull).
 */
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const payload = await verifyAuthCookie(cookieHeader);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let parsed: { session_ids?: unknown; command?: unknown };
    try {
      parsed = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const command = typeof parsed.command === 'string' ? parsed.command : 'unblock';
    if (!ALLOWED_COMMANDS.has(command)) {
      return NextResponse.json({ error: 'Unsupported command' }, { status: 400 });
    }
    if (!Array.isArray(parsed.session_ids) || parsed.session_ids.length === 0) {
      return NextResponse.json({ error: 'session_ids must be a non-empty array' }, { status: 400 });
    }

    // Resolve org server-side; never trust a client-supplied org_id.
    const profileRes = await fetch(`${LAMBDA_URL}/api/profile`, {
      method: 'GET',
      headers: { cookie: cookieHeader ?? '' },
    });
    if (!profileRes.ok) {
      return NextResponse.json({ error: 'Failed to resolve organization' }, { status: 403 });
    }
    const org_id = (await profileRes.json()).organization_id;
    if (!org_id) {
      return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
    }

    const backendRes = await fetch(`${LAMBDA_URL}/devices/command`, {
      method: 'POST',
      headers: {
        cookie: cookieHeader ?? '',
        'content-type': 'application/json',
        'x-csrf-token': req.headers.get('x-csrf-token') ?? '',
      },
      body: JSON.stringify({ command, session_ids: parsed.session_ids, org_id }),
    });

    // Pass the backend response through verbatim (status + body). The body is
    // a structured per-device breakdown ({ sent, failed, results, skipped })
    // even on a partial (207) or total (502) failure, and the dashboard needs
    // that detail to know which devices to let the admin resend.
    const body = await backendRes.json().catch(() => ({ error: 'Backend error' }));
    return NextResponse.json(body, { status: backendRes.status });
  } catch (error) {
    console.error('Session command error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
