const APP_DATE_OVERRIDE_KEY = "capd-support:dev:app-date-override:v1";

function isDateLocal(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isFinite(date.getTime());
}

function readTimePartsInJst(source: Date): { hour: string; minute: string; second: string } {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = formatter.formatToParts(source);
  const pick = (partType: "hour" | "minute" | "second"): string =>
    parts.find((part) => part.type === partType)?.value ?? "00";
  return {
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second")
  };
}

export function getAppDateOverrideDateLocal(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(APP_DATE_OVERRIDE_KEY);
  if (!stored || !isDateLocal(stored)) {
    return null;
  }
  return stored;
}

export function setAppDateOverrideDateLocal(dateLocal: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (dateLocal === null) {
    window.localStorage.removeItem(APP_DATE_OVERRIDE_KEY);
    return;
  }
  const normalized = dateLocal.trim();
  if (!isDateLocal(normalized)) {
    throw new Error(`Invalid dateLocal: ${dateLocal}`);
  }
  window.localStorage.setItem(APP_DATE_OVERRIDE_KEY, normalized);
}

function getNowWithOverride(sourceNow: Date = new Date()): Date {
  const override = getAppDateOverrideDateLocal();
  if (!override) {
    return sourceNow;
  }

  const time = readTimePartsInJst(sourceNow);
  const overridden = new Date(`${override}T${time.hour}:${time.minute}:${time.second}+09:00`);
  if (!Number.isFinite(overridden.getTime())) {
    return sourceNow;
  }
  return overridden;
}

export function toDateLocalJst(source?: Date | string): string {
  const date = source ? (typeof source === "string" ? new Date(source) : source) : getNowWithOverride();
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(date)
    .replaceAll("/", "-");
}

export function nowIso(): string {
  return getNowWithOverride().toISOString();
}

export function addMinutesIso(baseIso: string, minutes: number): string {
  const base = new Date(baseIso);
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}
