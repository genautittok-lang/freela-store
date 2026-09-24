import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "freela.store",
    time: new Date().toISOString(),
  });
}
