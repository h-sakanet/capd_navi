export type StorageScope = "local" | "indexeddb_database" | "indexeddb_store";

export type StorageFilterScope = "all" | "local" | "indexeddb";

export type StoragePreviewItem = {
  id: string;
  scope: StorageScope;
  key: string;
  dbName?: string;
  storeName?: string;
  sizeBytes?: number;
  recordCount?: number;
  previewText: string;
  rawValue?: string;
};

export type DeleteTarget = {
  scope: StorageScope;
  key: string;
  dbName?: string;
  storeName?: string;
};

export type StorageSnapshot = {
  items: StoragePreviewItem[];
  warnings: string[];
  generatedAtIso: string;
};
