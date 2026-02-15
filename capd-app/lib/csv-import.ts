import { parseProtocolCsv, type ProtocolStep } from "./protocol-csv";

export type CsvImportResult = {
  templatesSaved: number;
  stepCount: number;
  timerCount: number;
  alarmCount: number;
  recordEventCount: number;
  steps: ProtocolStep[];
  referencedImages: string[];
};

export function normalizeImageList(imagesText: string): string[] {
  return imagesText
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeFileMatchKey(value: string): string {
  return value.replace(/\uFEFF/g, "").trim().normalize("NFC");
}

function toCaseInsensitiveFileMatchKey(value: string): string {
  return normalizeFileMatchKey(value).toLocaleLowerCase("ja-JP");
}

export function extractReferencedImages(csvText: string): string[] {
  const steps = parseProtocolCsv(csvText);
  const images = new Set<string>();

  for (const step of steps) {
    if (step.image) {
      images.add(step.image);
    }
  }

  return Array.from(images);
}

export function collectDirectChildFiles(files: FileList | File[]): Map<string, File> {
  const entries = Array.from(files);
  const collected = new Map<string, File>();

  for (const file of entries) {
    const withRelative = file as File & { webkitRelativePath?: string };
    const relativePath = (withRelative.webkitRelativePath ?? "").trim();

    if (relativePath) {
      const normalizedPath = relativePath.replace(/^\/+|\/+$/g, "");
      const segments = normalizedPath.split("/").filter(Boolean);
      if (segments.length !== 2) {
        continue;
      }
    }

    const key = normalizeFileMatchKey(file.name);
    if (!collected.has(key)) {
      collected.set(key, file);
    }
  }

  return collected;
}

export function validateReferencedImages(
  referenced: string[],
  availableNames: string[]
): {
  missing: string[];
  matched: string[];
} {
  const referencedUnique = Array.from(new Set(referenced.map((value) => value.trim()).filter(Boolean)));
  const availableSet = new Set(availableNames.map((value) => normalizeFileMatchKey(value)).filter(Boolean));
  const availableCaseInsensitiveSet = new Set(
    availableNames.map((value) => toCaseInsensitiveFileMatchKey(value)).filter(Boolean)
  );
  const missing: string[] = [];
  const matched: string[] = [];

  for (const imageName of referencedUnique) {
    const normalizedImageName = normalizeFileMatchKey(imageName);
    const caseInsensitiveImageName = toCaseInsensitiveFileMatchKey(imageName);
    if (availableSet.has(normalizedImageName) || availableCaseInsensitiveSet.has(caseInsensitiveImageName)) {
      matched.push(imageName);
      continue;
    }
    missing.push(imageName);
  }

  return {
    missing,
    matched
  };
}

export function findSelectedFileByAssetKey(filesByName: Map<string, File>, assetKey: string): File | undefined {
  const normalizedAssetKey = normalizeFileMatchKey(assetKey);
  const direct = filesByName.get(normalizedAssetKey);
  if (direct) {
    return direct;
  }

  const caseInsensitiveAssetKey = toCaseInsensitiveFileMatchKey(assetKey);
  for (const [name, file] of filesByName.entries()) {
    if (toCaseInsensitiveFileMatchKey(name) === caseInsensitiveAssetKey) {
      return file;
    }
  }

  return undefined;
}

export function validateCsvImport(csvText: string): CsvImportResult {
  const steps = parseProtocolCsv(csvText);
  const referencedImages = Array.from(new Set(steps.map((step) => step.image.trim()).filter(Boolean)));

  return {
    templatesSaved: 1,
    stepCount: steps.length,
    timerCount: steps.filter((step) => step.timerId && (step.timerEvent === "start" || step.timerEvent === "end")).length,
    alarmCount: steps.filter((step) => step.alarmId).length,
    recordEventCount: steps.filter((step) => step.recordEvent).length,
    steps,
    referencedImages
  };
}
