import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  const json = (await request.json().catch(() => null)) as
    | {
        name?: string;
        sessionId?: string;
        toolId?: string;
        locale?: string;
        processingMode?: string;
        result?: string;
        path?: string;
      }
    | null;
  if (!json?.name || !json.sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  recordEvent({
    name: json.name,
    sessionId: json.sessionId.slice(0, 80),
    toolId: json.toolId,
    locale: json.locale,
    processingMode: json.processingMode,
    result: json.result,
    path: json.path?.slice(0, 200),
  });
  return NextResponse.json({ ok: true });
}
