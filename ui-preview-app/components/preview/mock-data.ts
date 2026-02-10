export type DrainAppearance = "透明" | "やや混濁" | "混濁" | "血性" | "その他";

export type DailyExchange = {
  id: string;
  recordExchangeNo: number;
  timerExchangeNo: number;
  dwellStart: string;
  dwellEnd: string;
  drainStart: string;
  drainEnd: string;
  csvTitle: string;
  drainWeightG: number;
  infuseWeightG: number;
  drainAppearance: DrainAppearance;
  photoId?: string;
};

export type DailyCapdNote = {
  id: string;
  date: string;
  weekdayJp: string;
  protocolName: string;
  status: "完了" | "中断";
  openingInfuseWeightG: number | null;
  exchanges: DailyExchange[];
  bodyWeightKg: number;
  urineMl: number;
  fluidIntakeMl: number;
  stoolCountPerDay: number;
  bpSys: number;
  bpDia: number;
  exitSiteStatus: string;
  notes: string;
};

export const dailyCapdNotes: DailyCapdNote[] = [
  {
    id: "note-2026-02-09",
    date: "2026-02-09",
    weekdayJp: "月",
    protocolName: "レギニュール1.5",
    status: "完了",
    openingInfuseWeightG: null,
    exchanges: [
      {
        id: "ex-20260209-01",
        recordExchangeNo: 1,
        timerExchangeNo: 1,
        dwellStart: "07:00",
        dwellEnd: "12:30",
        drainStart: "12:30",
        drainEnd: "12:45",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2050,
        infuseWeightG: 2000,
        drainAppearance: "透明",
        photoId: "photo-20260209-a"
      },
      {
        id: "ex-20260209-02",
        recordExchangeNo: 2,
        timerExchangeNo: 2,
        dwellStart: "12:45",
        dwellEnd: "17:30",
        drainStart: "17:30",
        drainEnd: "17:44",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2065,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260209-03",
        recordExchangeNo: 3,
        timerExchangeNo: 3,
        dwellStart: "17:44",
        dwellEnd: "21:50",
        drainStart: "21:50",
        drainEnd: "22:06",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2100,
        infuseWeightG: 2000,
        drainAppearance: "やや混濁"
      },
      {
        id: "ex-20260209-04",
        recordExchangeNo: 4,
        timerExchangeNo: 4,
        dwellStart: "22:06",
        dwellEnd: "01:30",
        drainStart: "01:30",
        drainEnd: "01:47",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2020,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260209-05",
        recordExchangeNo: 5,
        timerExchangeNo: 5,
        dwellStart: "01:47",
        dwellEnd: "07:00",
        drainStart: "07:00",
        drainEnd: "07:14",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2040,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      }
    ],
    bodyWeightKg: 60.0,
    urineMl: 500,
    fluidIntakeMl: 700,
    stoolCountPerDay: 1,
    bpSys: 128,
    bpDia: 76,
    exitSiteStatus: "正常",
    notes: "定期外来日"
  },
  {
    id: "note-2026-02-08",
    date: "2026-02-08",
    weekdayJp: "日",
    protocolName: "レギニュール1.5",
    status: "完了",
    openingInfuseWeightG: null,
    exchanges: [
      {
        id: "ex-20260208-01",
        recordExchangeNo: 1,
        timerExchangeNo: 1,
        dwellStart: "07:15",
        dwellEnd: "12:40",
        drainStart: "12:40",
        drainEnd: "12:54",
        csvTitle: "レギニュール1.5",
        drainWeightG: 1980,
        infuseWeightG: 2000,
        drainAppearance: "透明",
        photoId: "photo-20260208-b"
      },
      {
        id: "ex-20260208-02",
        recordExchangeNo: 2,
        timerExchangeNo: 2,
        dwellStart: "12:54",
        dwellEnd: "18:05",
        drainStart: "18:05",
        drainEnd: "18:21",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2015,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260208-03",
        recordExchangeNo: 3,
        timerExchangeNo: 3,
        dwellStart: "18:21",
        dwellEnd: "23:10",
        drainStart: "23:10",
        drainEnd: "23:28",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2040,
        infuseWeightG: 2000,
        drainAppearance: "やや混濁"
      },
      {
        id: "ex-20260208-04",
        recordExchangeNo: 4,
        timerExchangeNo: 4,
        dwellStart: "23:28",
        dwellEnd: "03:05",
        drainStart: "03:05",
        drainEnd: "03:20",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2005,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260208-05",
        recordExchangeNo: 5,
        timerExchangeNo: 5,
        dwellStart: "03:20",
        dwellEnd: "07:15",
        drainStart: "07:15",
        drainEnd: "07:31",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2025,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      }
    ],
    bodyWeightKg: 60.1,
    urineMl: 620,
    fluidIntakeMl: 900,
    stoolCountPerDay: 1,
    bpSys: 124,
    bpDia: 74,
    exitSiteStatus: "正常",
    notes: ""
  },
  {
    id: "note-2026-02-07",
    date: "2026-02-07",
    weekdayJp: "土",
    protocolName: "レギニュール1.5",
    status: "完了",
    openingInfuseWeightG: null,
    exchanges: [
      {
        id: "ex-20260207-01",
        recordExchangeNo: 1,
        timerExchangeNo: 1,
        dwellStart: "07:20",
        dwellEnd: "12:25",
        drainStart: "12:25",
        drainEnd: "12:38",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2012,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260207-02",
        recordExchangeNo: 2,
        timerExchangeNo: 2,
        dwellStart: "12:38",
        dwellEnd: "18:10",
        drainStart: "18:10",
        drainEnd: "18:25",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2024,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260207-03",
        recordExchangeNo: 3,
        timerExchangeNo: 3,
        dwellStart: "18:25",
        dwellEnd: "23:10",
        drainStart: "23:10",
        drainEnd: "23:26",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2045,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260207-04",
        recordExchangeNo: 4,
        timerExchangeNo: 4,
        dwellStart: "23:26",
        dwellEnd: "03:00",
        drainStart: "03:00",
        drainEnd: "03:14",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2008,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      },
      {
        id: "ex-20260207-05",
        recordExchangeNo: 5,
        timerExchangeNo: 5,
        dwellStart: "03:14",
        dwellEnd: "07:20",
        drainStart: "07:20",
        drainEnd: "07:35",
        csvTitle: "レギニュール1.5",
        drainWeightG: 2015,
        infuseWeightG: 2000,
        drainAppearance: "透明"
      }
    ],
    bodyWeightKg: 59.9,
    urineMl: 760,
    fluidIntakeMl: 780,
    stoolCountPerDay: 0,
    bpSys: 118,
    bpDia: 73,
    exitSiteStatus: "正常",
    notes: "夜間排液後に再確認"
  }
];

export function calculateExchangeUfG(note: DailyCapdNote, exchangeIndex: number): number | null {
  const exchange = note.exchanges[exchangeIndex];
  if (exchangeIndex === 0) {
    return null;
  }
  const previousInfuse = note.exchanges[exchangeIndex - 1]?.infuseWeightG;
  if (!exchange || typeof previousInfuse !== "number") {
    return null;
  }
  return exchange.drainWeightG - previousInfuse;
}

export function calculateDailyUfTotalG(note: DailyCapdNote): number {
  return note.exchanges.reduce((sum, _exchange, index) => {
    const uf = calculateExchangeUfG(note, index);
    return sum + (uf ?? 0);
  }, 0);
}

export function calculateDailyDrainTotalG(note: DailyCapdNote): number {
  return note.exchanges.reduce((sum, exchange) => sum + exchange.drainWeightG, 0);
}

export function calculateDailyInfuseTotalG(note: DailyCapdNote): number {
  return note.exchanges.reduce((sum, exchange) => sum + exchange.infuseWeightG, 0);
}

export function findFirstPhotoId(note: DailyCapdNote): string | null {
  const exchangeWithPhoto = note.exchanges.find((exchange) => exchange.photoId);
  return exchangeWithPhoto?.photoId ?? null;
}
