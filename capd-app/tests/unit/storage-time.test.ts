import { afterEach, describe, expect, it } from "vitest";

import { getAppDateOverrideDateLocal, nowIso, setAppDateOverrideDateLocal, toDateLocalJst } from "../../lib/storage/time";

function createLocalStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  } as Storage;
}

function installWindow(): void {
  (globalThis as { window?: unknown }).window = {
    localStorage: createLocalStorage()
  };
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("storage-time", () => {
  it("UT-TIME-001: override未設定時は通常のJST日付を返す", () => {
    const dateLocal = toDateLocalJst("2026-02-12T03:00:00.000Z");
    expect(dateLocal).toBe("2026-02-12");
  });

  it("UT-TIME-002: override設定でtoDateLocalJst/nowIsoの基準日付が切り替わる", () => {
    installWindow();

    setAppDateOverrideDateLocal("2026-03-01");

    expect(getAppDateOverrideDateLocal()).toBe("2026-03-01");
    expect(toDateLocalJst()).toBe("2026-03-01");
    expect(toDateLocalJst(nowIso())).toBe("2026-03-01");
  });

  it("UT-TIME-003: override解除で現在日に戻る", () => {
    installWindow();
    setAppDateOverrideDateLocal("2026-03-01");
    setAppDateOverrideDateLocal(null);

    expect(getAppDateOverrideDateLocal()).toBeNull();
    expect(toDateLocalJst(nowIso())).toBe(toDateLocalJst(new Date()));
  });
});
