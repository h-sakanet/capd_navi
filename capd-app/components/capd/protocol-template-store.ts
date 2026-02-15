"use client";

import type { ProtocolStep } from "@/lib/protocol-csv";
import {
  getProtocolPackage,
  listProtocolPackages,
  type UpsertProtocolAssetInput,
  upsertProtocolAssets,
  upsertProtocolPackage
} from "@/lib/storage/protocol.repo";
import type { ImportValidationMessage } from "@/lib/storage/models";

export type ProtocolTemplate = {
  protocolId: string;
  protocolName: string;
  importedAt: string;
  stepCount: number;
};

export type UpsertProtocolTemplateInput = ProtocolTemplate & {
  steps: ProtocolStep[];
  assets?: UpsertProtocolAssetInput[];
  validationReport?: {
    errors: ImportValidationMessage[];
    warnings: ImportValidationMessage[];
  };
};

export const LEGACY_TEMPLATE_STORAGE_KEY = "capd-support:templates:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function hasLegacyProtocolTemplates(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function clearLegacyProtocolTemplates(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(LEGACY_TEMPLATE_STORAGE_KEY);
}

export async function readProtocolTemplates(): Promise<ProtocolTemplate[]> {
  const rows = await listProtocolPackages();
  return rows.map((row) => ({
    protocolId: row.protocolId,
    protocolName: row.protocolName,
    importedAt: row.importedAt,
    stepCount: row.stepCount
  }));
}

export async function readProtocolTemplateById(protocolId: string): Promise<UpsertProtocolTemplateInput | null> {
  const row = await getProtocolPackage(protocolId);
  if (!row) {
    return null;
  }

  return {
    protocolId: row.protocolId,
    protocolName: row.protocolName,
    importedAt: row.importedAt,
    stepCount: row.stepCount,
    steps: row.steps,
    validationReport: row.validationReport
  };
}

export async function upsertProtocolTemplate(input: UpsertProtocolTemplateInput): Promise<void> {
  await upsertProtocolPackage({
    protocolId: input.protocolId,
    protocolName: input.protocolName,
    importedAt: input.importedAt,
    stepCount: input.stepCount,
    steps: input.steps,
    validationReport: input.validationReport
  });
  await upsertProtocolAssets(input.protocolId, input.assets ?? []);

  clearLegacyProtocolTemplates();
}
