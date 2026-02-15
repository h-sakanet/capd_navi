import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { ProtocolAssetEntity, ProtocolPackage } from "@/lib/storage/models";

const PROTOCOL_ASSET_ID_PREFIX = "protasset::";

export type UpsertProtocolAssetInput = Omit<ProtocolAssetEntity, "photoId" | "protocolId">;

export function toProtocolAssetPhotoId(protocolId: string, assetKey: string): string {
  return `${PROTOCOL_ASSET_ID_PREFIX}${protocolId}::${assetKey}`;
}

export function isProtocolAssetPhotoId(photoId: string): boolean {
  return photoId.startsWith(PROTOCOL_ASSET_ID_PREFIX);
}

function normalizeProtocolPackage(value: unknown): ProtocolPackage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<ProtocolPackage>;
  if (
    typeof entity.protocolId !== "string" ||
    typeof entity.protocolName !== "string" ||
    typeof entity.importedAt !== "string" ||
    typeof entity.stepCount !== "number" ||
    !Array.isArray(entity.steps)
  ) {
    return null;
  }

  return {
    protocolId: entity.protocolId,
    protocolName: entity.protocolName,
    importedAt: entity.importedAt,
    stepCount: entity.stepCount,
    steps: entity.steps,
    validationReport: entity.validationReport
  };
}

function normalizeProtocolAsset(value: unknown): ProtocolAssetEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<ProtocolAssetEntity>;
  const isBlob = typeof Blob !== "undefined" && entity.blob instanceof Blob;
  if (
    typeof entity.photoId !== "string" ||
    typeof entity.protocolId !== "string" ||
    typeof entity.assetKey !== "string" ||
    typeof entity.mimeType !== "string" ||
    typeof entity.sizeBytes !== "number" ||
    !isBlob ||
    typeof entity.importedAt !== "string" ||
    typeof entity.sourceFileName !== "string"
  ) {
    return null;
  }

  return {
    photoId: entity.photoId,
    protocolId: entity.protocolId,
    assetKey: entity.assetKey,
    mimeType: entity.mimeType,
    sizeBytes: entity.sizeBytes,
    blob: entity.blob,
    importedAt: entity.importedAt,
    sourceFileName: entity.sourceFileName
  };
}

export async function upsertProtocolPackage(input: ProtocolPackage): Promise<void> {
  await withTransaction("protocol_packages", "readwrite", async (transaction) => {
    const store = transaction.objectStore("protocol_packages");
    await requestToPromise(store.put(input));
  });
}

export async function getProtocolPackage(protocolId: string): Promise<ProtocolPackage | null> {
  return withTransaction("protocol_packages", "readonly", async (transaction) => {
    const store = transaction.objectStore("protocol_packages");
    const entity = await requestToPromise(store.get(protocolId));
    return normalizeProtocolPackage(entity);
  });
}

export async function listProtocolPackages(): Promise<ProtocolPackage[]> {
  return withTransaction("protocol_packages", "readonly", async (transaction) => {
    const store = transaction.objectStore("protocol_packages");
    const rows = await requestToPromise(store.getAll());
    return rows
      .map((row) => normalizeProtocolPackage(row))
      .filter((row): row is ProtocolPackage => row !== null)
      .sort((a, b) => b.importedAt.localeCompare(a.importedAt));
  });
}

export async function deleteProtocolPackage(protocolId: string): Promise<void> {
  await withTransaction("protocol_packages", "readwrite", async (transaction) => {
    const store = transaction.objectStore("protocol_packages");
    await requestToPromise(store.delete(protocolId));
  });
}

export async function upsertProtocolAssets(protocolId: string, assets: UpsertProtocolAssetInput[]): Promise<void> {
  await withTransaction("photo_meta", "readwrite", async (transaction) => {
    const store = transaction.objectStore("photo_meta");
    const rows = await requestToPromise(store.getAll());

    for (const row of rows) {
      const normalized = normalizeProtocolAsset(row);
      if (!normalized || normalized.protocolId !== protocolId) {
        continue;
      }
      await requestToPromise(store.delete(normalized.photoId));
    }

    for (const asset of assets) {
      const next: ProtocolAssetEntity = {
        photoId: toProtocolAssetPhotoId(protocolId, asset.assetKey),
        protocolId,
        assetKey: asset.assetKey,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        blob: asset.blob,
        importedAt: asset.importedAt,
        sourceFileName: asset.sourceFileName
      };
      await requestToPromise(store.put(next));
    }
  });
}

export async function getProtocolAsset(protocolId: string, assetKey: string): Promise<ProtocolAssetEntity | null> {
  return withTransaction("photo_meta", "readonly", async (transaction) => {
    const store = transaction.objectStore("photo_meta");
    const row = await requestToPromise(store.get(toProtocolAssetPhotoId(protocolId, assetKey)));
    const normalized = normalizeProtocolAsset(row);
    if (!normalized) {
      return null;
    }
    if (normalized.protocolId !== protocolId || normalized.assetKey !== assetKey) {
      return null;
    }
    return normalized;
  });
}

export async function deleteProtocolAssetsByProtocol(protocolId: string): Promise<void> {
  await withTransaction("photo_meta", "readwrite", async (transaction) => {
    const store = transaction.objectStore("photo_meta");
    const rows = await requestToPromise(store.getAll());

    for (const row of rows) {
      const normalized = normalizeProtocolAsset(row);
      if (!normalized || normalized.protocolId !== protocolId) {
        continue;
      }
      await requestToPromise(store.delete(normalized.photoId));
    }
  });
}
