import { describe, expect, it } from "vitest";

import {
  CAPD_DB_NAME,
  CAPD_DB_VERSION,
  CAPD_STORE_NAMES
} from "../../lib/storage/capd-db";

describe("capd-db", () => {
  it("UT-DB-001: IndexedDB スキーマ定義がPhase1契約を満たす", () => {
    expect(CAPD_DB_NAME).toBe("capd-support-db");
    expect(CAPD_DB_VERSION).toBe(1);
    expect(CAPD_STORE_NAMES).toEqual([
      "protocol_packages",
      "daily_procedure_plans",
      "sessions",
      "session_protocol_snapshots",
      "records",
      "timer_events",
      "alarm_dispatch_jobs",
      "outbox_mutations",
      "sync_state",
      "photo_meta"
    ]);
  });
});
