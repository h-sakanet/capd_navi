import type { HomeNoteEntity } from "@/lib/storage/models";

function findExchange(note: HomeNoteEntity, exchangeNo: number) {
  return note.exchanges.find((exchange) => exchange.exchangeNo === exchangeNo);
}

export function calculateHomeExchangeUf(note: HomeNoteEntity, exchangeNo: number): number | null {
  const current = findExchange(note, exchangeNo);
  if (!current || current.drainWeightG === null) {
    return null;
  }

  if (current.bagWeightG !== null) {
    return current.drainWeightG - current.bagWeightG;
  }

  const previous = findExchange(note, exchangeNo - 1);
  if (!previous || previous.bagWeightG === null) {
    return current.drainWeightG;
  }

  return current.drainWeightG - previous.bagWeightG;
}

export function calculateHomeDailyUfTotal(note: HomeNoteEntity): number | null {
  let total = 0;
  let calculatedCount = 0;

  for (const exchange of note.exchanges) {
    const uf = calculateHomeExchangeUf(note, exchange.exchangeNo);
    if (uf === null) {
      continue;
    }
    total += uf;
    calculatedCount += 1;
  }

  return calculatedCount > 0 ? total : null;
}
