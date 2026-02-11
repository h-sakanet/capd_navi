import { NextResponse } from "next/server";

import { pullFromCloud } from "@/lib/sync-cloud-store";

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const result = pullFromCloud(json as Parameters<typeof pullFromCloud>[0]);
  return NextResponse.json(result.body, { status: result.httpStatus });
}
