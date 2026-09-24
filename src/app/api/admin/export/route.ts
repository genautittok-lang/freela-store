import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { eventsCsv } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const user = await currentAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const range = request.nextUrl.searchParams.get("range") || "30d";
  const csv = eventsCsv(range);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="freela-events-${range}.csv"`,
      "x-robots-tag": "noindex",
    },
  });
}
