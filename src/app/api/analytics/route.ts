import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics";
import { clientIp, clientOriginAllowed, rateLimit, sanitizeAnalyticsPayload } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!clientOriginAllowed(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  if (!rateLimit(`analytics:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const json = await request.json().catch(() => null);
  const event = sanitizeAnalyticsPayload(json);
  if (!event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  recordEvent(event);
  return NextResponse.json({ ok: true });
}
