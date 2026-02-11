import { normalizeImageList, validateCsvImport } from "../../lib/csv-import";

const csvText = [
  "row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit",
  "meta,format_version,3,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_id,p1,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_name,n1,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_version,v1,,,,,,,,,,,,,,,,,,,,,",
  "meta,effective_from_local,2026-02-11T00:00:00+09:00,,,,,,,,,,,,,,,,,,,,,",
  "step,,,1,step_001,,準備,お腹-独立,開始,img-1.png,表示,,,,,,,,,,,,"
].join("\n");

describe("csv-import", () => {
  it("UT-CSV-008: 画像リストを正規化できる", () => {
    const normalized = normalizeImageList("img-1.png, img-2.png\nimg-3.png");
    expect(normalized).toEqual(["img-1.png", "img-2.png", "img-3.png"]);
  });

  it("UT-CSV-011: CSVと画像一覧が整合すれば成功", () => {
    const result = validateCsvImport(csvText, ["img-1.png"]);
    expect(result.stepCount).toBe(1);
  });
});
