import { readFileSync } from "node:fs";
import path from "node:path";

import { parseProtocolCsv } from "../../lib/protocol-csv";

const csvHeader =
  "通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,必須チェック数,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit";

describe("parseProtocolCsv", () => {
  it("UT-CSV-001: 正常CSVを読み込みstepを返す", () => {
    const csvPath = path.join(process.cwd(), "public", "protocols", "session.csv");
    const csvText = readFileSync(csvPath, "utf-8");

    const steps = parseProtocolCsv(csvText);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0]?.stepId).toBe("step_001");
    expect(steps[0]?.nextStepId).toBe("step_002");
  });

  it("UT-CSV-004: ヘッダー不一致で例外を返す", () => {
    const csvText = [
      "row_type,meta_key,meta_value,通し番号,step_id,next_step_id",
      "step,,,1,step_001,step_002"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow("CSVヘッダーが不正です。");
  });

  it("UT-CSV-012: 必須チェック数列が欠落したヘッダーは例外を返す", () => {
    const csvText = [
      "通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit",
      "1,step_001,,準備,お腹-独立,開始,img-1.png,表示,,,,,,,,,,,,,"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow("CSVヘッダーが不正です。");
  });

  it("UT-CSV-002: step_id 重複で例外を返す", () => {
    const csvText = [
      csvHeader,
      "1,step_001,step_001,準備,お腹-独立,開始,img-1.png,表示A,,チェックA,1,,,,,,,,,,,",
      "2,step_001,,終了,お腹-独立,終了,img-2.png,表示B,,,,,,,,,,,,"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow("step_id が重複しています: step_001");
  });

  it("UT-CSV-006: next_step_id が未定義stepを参照したら例外", () => {
    const csvText = [
      csvHeader,
      "1,step_001,step_999,準備,お腹-独立,開始,img-1.png,表示A,,,,,,,,,,,,,"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow(
      "next_step_id が未定義の step_id を参照しています: step_999"
    );
  });
});
