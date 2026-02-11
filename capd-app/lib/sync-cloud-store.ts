export type SyncItem = {
  entityType: string;
  entityId: string;
  updatedAt: string;
  payload: unknown;
};

type Partition = {
  entities: Map<string, SyncItem>;
};

type SyncCloudStore = Map<string, Partition>;

type PushRequest = {
  cloudId?: string;
  items?: SyncItem[];
  outboxIds?: string[];
  mode?: "normal" | "full_reseed";
  simulateFailure?: boolean;
};

type PullRequest = {
  cloudId?: string;
  since?: string;
};

function getStore(): SyncCloudStore {
  const key = "__capdSyncCloudStore";
  const globalValue = globalThis as typeof globalThis & {
    __capdSyncCloudStore?: SyncCloudStore;
  };

  if (!globalValue[key]) {
    globalValue[key] = new Map<string, Partition>();
  }

  return globalValue[key];
}

function safeCloudId(value: string | undefined): string {
  return value && value.trim().length > 0 ? value.trim() : "default";
}

function itemKey(item: Pick<SyncItem, "entityType" | "entityId">): string {
  return `${item.entityType}:${item.entityId}`;
}

function parseUpdatedAt(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function blobKey(cloudId: string, item: Pick<SyncItem, "entityType" | "entityId">): string {
  return `capd/${cloudId}/${item.entityType}/${item.entityId}.json`;
}

function normalizeItems(items: unknown): SyncItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      entityType: String(item.entityType ?? "unknown"),
      entityId: String(item.entityId ?? "unknown"),
      updatedAt: String(item.updatedAt ?? new Date(0).toISOString()),
      payload: item.payload ?? null
    }));
}

export function pushToCloud(rawRequest: PushRequest) {
  const cloudId = safeCloudId(rawRequest.cloudId);
  const items = normalizeItems(rawRequest.items);

  if (rawRequest.simulateFailure) {
    return {
      httpStatus: 503,
      body: {
        status: "failed",
        cloudId,
        cloudState: getStore().has(cloudId) ? "ok" : "missing",
        applied: 0,
        ackedOutboxIds: [] as string[],
        blobKeys: [] as string[]
      }
    } as const;
  }

  const store = getStore();
  const currentPartition = store.get(cloudId);
  const partition =
    currentPartition ?? {
      entities: new Map<string, SyncItem>()
    };

  if (!currentPartition) {
    store.set(cloudId, partition);
  }

  let applied = 0;
  const changedKeys: string[] = [];

  for (const item of items) {
    const key = itemKey(item);
    const existing = partition.entities.get(key);

    if (!existing || parseUpdatedAt(item.updatedAt) >= parseUpdatedAt(existing.updatedAt)) {
      partition.entities.set(key, item);
      applied += 1;
      changedKeys.push(blobKey(cloudId, item));
    }
  }

  return {
    httpStatus: 200,
    body: {
      status: "ok",
      cloudId,
      cloudState: "ok",
      applied,
      ackedOutboxIds: Array.isArray(rawRequest.outboxIds) ? rawRequest.outboxIds : [],
      blobKeys: changedKeys
    }
  } as const;
}

export function pullFromCloud(rawRequest: PullRequest) {
  const cloudId = safeCloudId(rawRequest.cloudId);
  const partition = getStore().get(cloudId);

  if (!partition) {
    return {
      httpStatus: 200,
      body: {
        status: "ok",
        cloudId,
        cloudState: "missing",
        items: [] as SyncItem[],
        blobKeys: [] as string[]
      }
    } as const;
  }

  const since = rawRequest.since ? parseUpdatedAt(rawRequest.since) : null;
  const filteredItems = [...partition.entities.values()]
    .filter((item) => (since === null ? true : parseUpdatedAt(item.updatedAt) > since))
    .sort((a, b) => parseUpdatedAt(a.updatedAt) - parseUpdatedAt(b.updatedAt));

  return {
    httpStatus: 200,
    body: {
      status: "ok",
      cloudId,
      cloudState: "ok",
      items: filteredItems,
      blobKeys: filteredItems.map((item) => blobKey(cloudId, item))
    }
  } as const;
}
