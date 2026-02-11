import { parseProtocolCsv } from "./protocol-csv";

export type CsvImportResult = {
  templatesSaved: number;
  stepCount: number;
};

export function normalizeImageList(imagesText: string): string[] {
  return imagesText
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateCsvImport(csvText: string, availableImages: string[]): CsvImportResult {
  const steps = parseProtocolCsv(csvText);
  const imageSet = new Set(availableImages);

  for (const step of steps) {
    if (!step.image) {
      continue;
    }
    if (!imageSet.has(step.image)) {
      throw new Error(`画像が不足しています: ${step.image}`);
    }
  }

  return {
    templatesSaved: 1,
    stepCount: steps.length
  };
}
