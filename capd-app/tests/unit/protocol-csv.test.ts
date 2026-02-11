import { readFileSync } from "node:fs";
import path from "node:path";

import { parseProtocolCsv } from "../../lib/protocol-csv";

describe("parseProtocolCsv", () => {
  it("UT-CSV-001: 正常CSVを読み込みstepを返す", () => {
    const csvPath = path.join(process.cwd(), "public", "protocols", "session.csv");
    const csvText = readFileSync(csvPath, "utf-8");

    const steps = parseProtocolCsv(csvText);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0]?.stepId).toBe("step_001");
    expect(steps[0]?.nextStepId).toBe("step_002");
  });

  it("UT-CSV-004: 必須meta_key不足で例外を返す", () => {
    const csvText = [
      "row_type,meta_key,meta_value,通し番号,step_id,next_step_id",
      "meta,format_version,3,,,",
      "step,,,1,step_001,"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow("CSV v3の必須meta_keyが不足しています: protocol_id");
  });

  it("UT-CSV-002: step_id 重複で例外を返す", () => {
    const csvText = [
      "row_type,meta_key,meta_value,通し番号,step_id,next_step_id",
      "meta,format_version,3,,,",
      "meta,protocol_id,p1,,,",
      "meta,protocol_name,n1,,,",
      "meta,protocol_version,v1,,,",
      "meta,effective_from_local,2026-02-11T00:00:00+09:00,,,",
      "step,,,1,step_001,step_001",
      "step,,,2,step_001,"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow("step_id が重複しています: step_001");
  });

  it("UT-CSV-006: next_step_id が未定義stepを参照したら例外", () => {
    const csvText = [
      "row_type,meta_key,meta_value,通し番号,step_id,next_step_id",
      "meta,format_version,3,,,",
      "meta,protocol_id,p1,,,",
      "meta,protocol_name,n1,,,",
      "meta,protocol_version,v1,,,",
      "meta,effective_from_local,2026-02-11T00:00:00+09:00,,,",
      "step,,,1,step_001,step_999"
    ].join("\n");

    expect(() => parseProtocolCsv(csvText)).toThrow(
      "next_step_id が未定義の step_id を参照しています: step_999"
    );
  });
});
