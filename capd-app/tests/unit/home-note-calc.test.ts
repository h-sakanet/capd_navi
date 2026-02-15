import { describe, expect, it } from "vitest";

import type { HomeNoteEntity } from "../../lib/storage/models";
import { calculateHomeDailyUfTotal, calculateHomeExchangeUf } from "../../lib/services/home-note-calc";

function createNote(exchanges: HomeNoteEntity["exchanges"]): HomeNoteEntity {
  return {
    dateLocal: "2026-02-12",
    protocolName: "sample",
    exchanges,
    summary: {
      bodyWeightKg: null,
      urineMl: null,
      fluidIntakeMl: null,
      stoolCountPerDay: null,
      bpSys: null,
      bpDia: null,
      exitSiteStatus: "",
      notes: ""
    }
  };
}

describe("home-note-calc", () => {
  it("UT-HOME-UF-001: 同一交換に排液量と注液量があれば除水量を計算する", () => {
    const note = createNote([
      {
        exchangeNo: 2,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: 6700,
        bagWeightG: 2800,
        drainAppearance: ""
      }
    ]);

    expect(calculateHomeExchangeUf(note, 2)).toBe(3900);
  });

  it("UT-HOME-UF-002: 同一交換の注液量が無い場合は前回交換の注液量で計算する", () => {
    const note = createNote([
      {
        exchangeNo: 1,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: null,
        bagWeightG: 2000,
        drainAppearance: ""
      },
      {
        exchangeNo: 2,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: 2200,
        bagWeightG: null,
        drainAppearance: ""
      }
    ]);

    expect(calculateHomeExchangeUf(note, 2)).toBe(200);
  });

  it("UT-HOME-UF-003: 総除水量は計算できた交換のみ合算する", () => {
    const note = createNote([
      {
        exchangeNo: 1,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: 2100,
        bagWeightG: 2000,
        drainAppearance: ""
      },
      {
        exchangeNo: 2,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: 2300,
        bagWeightG: null,
        drainAppearance: ""
      },
      {
        exchangeNo: 3,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: null,
        bagWeightG: 2200,
        drainAppearance: ""
      }
    ]);

    expect(calculateHomeDailyUfTotal(note)).toBe(400);
  });

  it("UT-HOME-UF-004: 一つも計算できない場合は null を返す", () => {
    const note = createNote([
      {
        exchangeNo: 1,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: null,
        bagWeightG: null,
        drainAppearance: ""
      }
    ]);

    expect(calculateHomeDailyUfTotal(note)).toBeNull();
  });

  it("UT-HOME-UF-005: 排液量のみ入力時は注液量を0として計算する", () => {
    const note = createNote([
      {
        exchangeNo: 1,
        csvTitle: "",
        dwellStart: "",
        dwellEnd: "",
        drainStart: "",
        drainEnd: "",
        drainWeightG: 26,
        bagWeightG: null,
        drainAppearance: ""
      }
    ]);

    expect(calculateHomeExchangeUf(note, 1)).toBe(26);
    expect(calculateHomeDailyUfTotal(note)).toBe(26);
  });
});
