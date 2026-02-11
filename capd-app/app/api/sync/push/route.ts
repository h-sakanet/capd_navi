import { NextResponse } from "next/server";

import { pushToCloud } from "@/lib/sync-cloud-store";

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const result = pushToCloud(json as Parameters<typeof pushToCloud>[0]);
  return NextResponse.json(result.body, { status: result.httpStatus });
}
