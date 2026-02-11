export type ProtocolStep = {
  sequenceNo: number;
  stepId: string;
  nextStepId: string | null;
  phase: string;
  state: string;
  title: string;
  image: string;
  displayText: string;
  warningText: string;
  requiredChecks: string[];
  timerId: string;
  timerEvent: string;
  timerExchangeNo: string;
  timerSegment: string;
  alarmId: string;
  alarmTrigger: string;
  alarmDurationMin: number | null;
  alarmRelatedTimerId: string;
  recordEvent: string;
  recordExchangeNo: string;
  recordUnit: string;
};

function parseCsvMatrix(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];

    if (ch === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";

      if (ch === "\r" && csvText[i + 1] === "\n") {
        i += 1;
      }
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((line) => line.some((value) => value.length > 0));
}

function parseIntSafe(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toRecord(headers: string[], values: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });
  return record;
}

export function parseProtocolCsv(csvText: string): ProtocolStep[] {
  const matrix = parseCsvMatrix(csvText);
  if (matrix.length < 2) {
    throw new Error("CSVにヘッダー/データ行がありません。");
  }

  const headers = matrix[0].map((header) => header.trim());
  if (!headers.includes("row_type")) {
    throw new Error("CSV v3の必須列 row_type がありません。");
  }

  const records = matrix.slice(1).map((line) => toRecord(headers, line));
  const metaRows = records.filter((record) => (record.row_type ?? "").trim() === "meta");
  const metaMap = new Map(metaRows.map((record) => [(record.meta_key ?? "").trim(), (record.meta_value ?? "").trim()]));
  const requiredMetaKeys = ["format_version", "protocol_id", "protocol_name", "protocol_version", "effective_from_local"];
  for (const key of requiredMetaKeys) {
    if (!metaMap.get(key)) {
      throw new Error(`CSV v3の必須meta_keyが不足しています: ${key}`);
    }
  }
  if (metaMap.get("format_version") !== "3") {
    throw new Error("format_versionは3のみ対応です。");
  }

  const steps: ProtocolStep[] = records
    .filter((record) => (record.row_type ?? "").trim() === "step")
    .map((record) => {
      const stepId = (record.step_id ?? "").trim();
      if (!stepId) {
        return null;
      }

      const requiredChecks = (record["必須チェック"] ?? "")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const alarmDurationRaw = (record.alarm_duration_min ?? "").trim();
      const alarmDurationMin = alarmDurationRaw ? parseIntSafe(alarmDurationRaw) : null;

      return {
        sequenceNo: parseIntSafe((record["通し番号"] ?? "").trim()),
        stepId,
        nextStepId: (record.next_step_id ?? "").trim() || null,
        phase: (record["フェーズ"] ?? "").trim(),
        state: (record["状態"] ?? "").trim(),
        title: (record["タイトル"] ?? "").trim() || stepId,
        image: (record["画像"] ?? "").trim(),
        displayText: (record["表示テキスト"] ?? "").trim(),
        warningText: (record["警告テキスト"] ?? "").trim(),
        requiredChecks,
        timerId: (record.timer_id ?? "").trim(),
        timerEvent: (record.timer_event ?? "").trim(),
        timerExchangeNo: (record.timer_exchange_no ?? "").trim(),
        timerSegment: (record.timer_segment ?? "").trim(),
        alarmId: (record.alarm_id ?? "").trim(),
        alarmTrigger: (record.alarm_trigger ?? "").trim(),
        alarmDurationMin,
        alarmRelatedTimerId: (record.alarm_related_timer_id ?? "").trim(),
        recordEvent: (record.record_event ?? "").trim(),
        recordExchangeNo: (record.record_exchange_no ?? "").trim(),
        recordUnit: (record.record_unit ?? "").trim()
      };
    })
    .filter((step): step is ProtocolStep => step !== null)
    .sort((a, b) => a.sequenceNo - b.sequenceNo);

  if (!steps.length) {
    throw new Error("CSVにstep行がありません。");
  }

  const stepIdSet = new Set<string>();
  for (const step of steps) {
    if (stepIdSet.has(step.stepId)) {
      throw new Error(`step_id が重複しています: ${step.stepId}`);
    }
    stepIdSet.add(step.stepId);
  }

  for (const step of steps) {
    if (!step.nextStepId) {
      continue;
    }
    if (!stepIdSet.has(step.nextStepId)) {
      throw new Error(`next_step_id が未定義の step_id を参照しています: ${step.nextStepId}`);
    }
  }

  return steps;
}
