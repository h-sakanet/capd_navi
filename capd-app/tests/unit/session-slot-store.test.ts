import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearActiveSession,
  createSessionId,
  defaultProcedureSlots,
  readActiveSession,
  readProcedureSlots,
  writeActiveSession,
  writeProcedureSlots
} from "../../components/capd/session-slot-store";

const SLOT_STORAGE_KEY = "capd-support:home:slots:v1";
const ACTIVE_SESSION_STORAGE_KEY = "capd-support:home:active-session:v1";

type StorageSeed = Record<string, string>;

function createLocalStorage(seed: StorageSeed = {}): Storage {
  const store = new Map<string, string>(Object.entries(seed));

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    }
  } as Storage;
}

function installWindow(seed: StorageSeed = {}): void {
  (globalThis as { window?: unknown }).window = {
    localStorage: createLocalStorage(seed)
  };
}

describe("session-slot-store", () => {
  beforeEach(() => {
    installWindow();
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("UT-SLOT-001: localStorage未設定時はデフォルトスロットを返す", () => {
    expect(readProcedureSlots()).toEqual(defaultProcedureSlots);
  });

  it("UT-SLOT-002: 不正JSONでもデフォルトスロットを返す", () => {
    installWindow({
      [SLOT_STORAGE_KEY]: "{"
    });

    expect(readProcedureSlots()).toEqual(defaultProcedureSlots);
  });

  it("UT-SLOT-003: 配列長が4以外ならデフォルトスロットを返す", () => {
    installWindow({
      [SLOT_STORAGE_KEY]: JSON.stringify([null, null, null])
    });

    expect(readProcedureSlots()).toEqual(defaultProcedureSlots);
  });

  it("UT-SLOT-004: 要素型不正はnullに正規化される", () => {
    installWindow({
      [SLOT_STORAGE_KEY]: JSON.stringify([
        {
          protocolId: "p1",
          protocolLabel: "p1",
          recommendedTime: "20:00",
          status: "未実施"
        },
        {
          protocolId: 1
        },
        null,
        {
          protocolId: "p2",
          protocolLabel: "p2",
          recommendedTime: "22:00",
          status: "INVALID"
        }
      ])
    });

    expect(readProcedureSlots()).toEqual([
      {
        protocolId: "p1",
        protocolLabel: "p1",
        recommendedTime: "20:00",
        status: "未実施"
      },
      null,
      null,
      null
    ]);
  });

  it("UT-SLOT-005: 書き込み後に同値復元できる", () => {
    const slots = [
      {
        protocolId: "p1",
        protocolLabel: "p1",
        recommendedTime: "20:00",
        status: "未実施" as const
      },
      null,
      {
        protocolId: "p2",
        protocolLabel: "p2",
        recommendedTime: "23:00",
        status: "実施中" as const
      },
      null
    ];

    writeProcedureSlots(slots);
    expect(readProcedureSlots()).toEqual(slots);
  });

  it("UT-SLOT-006: active session未設定ならnull", () => {
    expect(readActiveSession()).toBeNull();
  });

  it("UT-SLOT-007: active sessionのslotIndex範囲外はnull", () => {
    installWindow({
      [ACTIVE_SESSION_STORAGE_KEY]: JSON.stringify({
        sessionId: "ses_1",
        slotIndex: 4,
        currentStepId: "step_001",
        updatedAtIso: "2026-02-12T00:00:00.000Z"
      })
    });

    expect(readActiveSession()).toBeNull();
  });

  it("UT-SLOT-008: active sessionを書き込み後に同値復元できる", () => {
    const session = {
      sessionId: "ses_1",
      slotIndex: 0,
      currentStepId: "step_001",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      mode: "runtime" as const,
      updatedAtIso: "2026-02-12T00:00:00.000Z"
    };

    writeActiveSession(session);
    expect(readActiveSession()).toEqual(session);
  });

  it("UT-SLOT-009: active session削除後はnull", () => {
    writeActiveSession({
      sessionId: "ses_1",
      slotIndex: 0,
      currentStepId: "step_001",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      mode: "runtime",
      updatedAtIso: "2026-02-12T00:00:00.000Z"
    });

    clearActiveSession();
    expect(readActiveSession()).toBeNull();
  });

  it("UT-SLOT-010: createSessionIdは ses_1_ 形式を返す", () => {
    expect(createSessionId(0)).toMatch(/^ses_1_\d+$/);
  });

  it("UT-SLOT-011: window未定義でもreadProcedureSlotsは安全に実行できる", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(readProcedureSlots()).toEqual(defaultProcedureSlots);
  });

  it("UT-SLOT-012: window未定義でもreadActiveSessionはnull", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(readActiveSession()).toBeNull();
  });
});
