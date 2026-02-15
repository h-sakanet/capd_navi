import type { Page } from "@playwright/test";

type SeedOptions = {
  sessionId: string;
  slotIndex: number;
  currentStepId: string;
  stepImageByStepId?: Record<string, string>;
  protocolAssets?: Array<{
    assetKey: string;
    mimeType?: string;
    content?: string;
  }>;
  slots?: Array<
    | {
        protocolId: string;
        protocolLabel: string;
        recommendedTime: string;
        status: "未実施" | "実施中" | "実施済み";
      }
    | null
  >;
};

const STEPS = [
  {
    sequenceNo: 21,
    stepId: "step_021",
    nextStepId: "step_022",
    phase: "廃液",
    state: "お腹→廃液バッグ",
    title: "お腹のチューブのクランプを開ける",
    image: "",
    displayText: "",
    warningText: "",
    requiredChecks: ["クランプを開けた"],
    timerSpec: {
      timerId: "1_drain",
      timerEvent: "start",
      timerExchangeNo: "1",
      timerSegment: "drain"
    },
    alarmSpec: null,
    recordSpec: null
  },
  {
    sequenceNo: 22,
    stepId: "step_022",
    nextStepId: "step_023",
    phase: "廃液",
    state: "お腹→廃液バッグ",
    title: "廃液中",
    image: "",
    displayText: "液が出なくなるまで10分程度待つ",
    warningText: "",
    requiredChecks: ["液が出なくなった"],
    timerSpec: null,
    alarmSpec: {
      alarmId: "1_drain_alarm",
      alarmTrigger: "step_enter",
      alarmDurationMin: 10,
      alarmRelatedTimerId: "1_drain"
    },
    recordSpec: null
  },
  {
    sequenceNo: 23,
    stepId: "step_023",
    nextStepId: "step_024",
    phase: "廃液",
    state: "お腹-接続",
    title: "お腹のチューブのクランプを閉じる",
    image: "",
    displayText: "",
    warningText: "",
    requiredChecks: ["クランプを閉じた"],
    timerSpec: null,
    alarmSpec: null,
    recordSpec: null
  },
  {
    sequenceNo: 24,
    stepId: "step_024",
    nextStepId: "step_025",
    phase: "廃液",
    state: "お腹-接続",
    title: "白いクランプを閉じる",
    image: "",
    displayText: "",
    warningText: "",
    requiredChecks: ["白いクランプを閉じた"],
    timerSpec: {
      timerId: "1_drain",
      timerEvent: "end",
      timerExchangeNo: "1",
      timerSegment: "drain"
    },
    alarmSpec: {
      alarmId: "drain_end_1",
      alarmTrigger: "timer_end",
      alarmDurationMin: 1,
      alarmRelatedTimerId: "1_drain"
    },
    recordSpec: null
  },
  {
    sequenceNo: 25,
    stepId: "step_025",
    nextStepId: "step_026",
    phase: "廃液",
    state: "お腹-接続",
    title: "廃液の様子を確認",
    image: "",
    displayText: "",
    warningText: "濁っていたら病院に連絡",
    requiredChecks: [],
    timerSpec: null,
    alarmSpec: null,
    recordSpec: {
      recordEvent: "drain_appearance",
      recordExchangeNo: "1",
      recordUnit: ""
    }
  },
  {
    sequenceNo: 26,
    stepId: "step_026",
    nextStepId: null,
    phase: "終了",
    state: "お腹-独立",
    title: "終了",
    image: "",
    displayText: "",
    warningText: "",
    requiredChecks: [],
    timerSpec: null,
    alarmSpec: null,
    recordSpec: null
  }
] as const;

const STORE_NAMES = [
  "protocol_packages",
  "daily_procedure_plans",
  "sessions",
  "session_protocol_snapshots",
  "records",
  "timer_events",
  "alarm_dispatch_jobs",
  "outbox_mutations",
  "sync_state",
  "photo_meta"
] as const;

export async function seedRuntimeSession(page: Page, input: SeedOptions): Promise<void> {
  const now = new Date().toISOString();
  const dateLocal = "2026-02-12";
  const slots =
    input.slots ??
    [
      {
        protocolId: "seed-protocol",
        protocolLabel: "seed-protocol",
        recommendedTime: "20:00",
        status: "実施中"
      },
      null,
      null,
      null
    ];

  await page.addInitScript(
    async ({ input: seed, nowIso, dateLocalIso, steps, stepImageSeed, protocolAssetsSeed, storeNames, slotsSeed }) => {
      function reqToPromise<T>(request: IDBRequest<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error ?? new Error("request failed"));
        });
      }

      function waitTx(transaction: IDBTransaction): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error("tx failed"));
          transaction.onabort = () => reject(transaction.error ?? new Error("tx aborted"));
        });
      }

      function createStores(db: IDBDatabase) {
        if (!db.objectStoreNames.contains("protocol_packages")) {
          db.createObjectStore("protocol_packages", { keyPath: "protocolId" });
        }
        if (!db.objectStoreNames.contains("daily_procedure_plans")) {
          db.createObjectStore("daily_procedure_plans", { keyPath: "dateLocal" });
        }
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "sessionId" });
          store.createIndex("by_date", "dateLocal", { unique: false });
          store.createIndex("by_status", "status", { unique: false });
        }
        if (!db.objectStoreNames.contains("session_protocol_snapshots")) {
          db.createObjectStore("session_protocol_snapshots", { keyPath: "sessionId" });
        }
        if (!db.objectStoreNames.contains("records")) {
          const store = db.createObjectStore("records", { keyPath: "recordId" });
          store.createIndex("by_session", "sessionId", { unique: false });
          store.createIndex("by_date", "dateLocal", { unique: false });
          store.createIndex("by_session_step", ["sessionId", "stepId"], { unique: false });
        }
        if (!db.objectStoreNames.contains("timer_events")) {
          const store = db.createObjectStore("timer_events", { keyPath: "eventId" });
          store.createIndex("by_session", "sessionId", { unique: false });
          store.createIndex("by_date", "dateLocal", { unique: false });
          store.createIndex("by_dedupe", "dedupeKey", { unique: true });
        }
        if (!db.objectStoreNames.contains("alarm_dispatch_jobs")) {
          const store = db.createObjectStore("alarm_dispatch_jobs", { keyPath: "jobId" });
          store.createIndex("by_session", "sessionId", { unique: false });
          store.createIndex("by_dedupe", "dedupeKey", { unique: true });
          store.createIndex("by_session_step", ["sessionId", "stepId"], { unique: false });
        }
        if (!db.objectStoreNames.contains("outbox_mutations")) {
          db.createObjectStore("outbox_mutations", { keyPath: "mutationId" });
        }
        if (!db.objectStoreNames.contains("sync_state")) {
          db.createObjectStore("sync_state", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("photo_meta")) {
          db.createObjectStore("photo_meta", { keyPath: "photoId" });
        }
      }

      const openRequest = window.indexedDB.open("capd-support-db", 1);
      openRequest.onupgradeneeded = () => createStores(openRequest.result);
      const db = await reqToPromise(openRequest);

      const tx = db.transaction(storeNames, "readwrite");
      const activeSlot = slotsSeed[seed.slotIndex];
      const protocolId =
        activeSlot && typeof activeSlot === "object" && "protocolId" in activeSlot
          ? String(activeSlot.protocolId)
          : "seed-protocol";
      const seededSteps = steps.map((step) => ({
        ...step,
        image: stepImageSeed[step.stepId] ?? step.image
      }));
      for (const storeName of storeNames) {
        tx.objectStore(storeName).clear();
      }

      tx.objectStore("protocol_packages").put({
        protocolId,
        protocolName: protocolId,
        importedAt: nowIso,
        stepCount: seededSteps.length,
        steps: seededSteps
      });

      tx.objectStore("daily_procedure_plans").put({
        dateLocal: dateLocalIso,
        updatedAtIso: nowIso,
        slots: slotsSeed
      });

      tx.objectStore("sessions").put({
        sessionId: seed.sessionId,
        slotIndex: seed.slotIndex,
        dateLocal: dateLocalIso,
        protocolId,
        snapshotHash: "h_seed",
        currentStepId: seed.currentStepId,
        status: "active",
        startedAtIso: nowIso,
        completedAtIso: null,
        abortedAtIso: null,
        updatedAtIso: nowIso
      });

      tx.objectStore("session_protocol_snapshots").put({
        sessionId: seed.sessionId,
        sourceProtocol: {
          protocolId,
          protocolName: protocolId,
          importedAt: nowIso
        },
        steps: seededSteps,
        assetManifest: seededSteps
          .filter((step) => Boolean(step.image))
          .map((step) => ({
            assetKey: step.image,
            sourceRelativePath: step.image
          })),
        snapshotHash: "h_seed",
        createdAtIso: nowIso
      });

      for (const asset of protocolAssetsSeed) {
        const content =
          asset.content ??
          `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#111"/><text x="12" y="66" fill="#fff" font-size="14">${asset.assetKey}</text></svg>`;
        const blob = new Blob([content], {
          type: asset.mimeType || "image/svg+xml"
        });
        tx.objectStore("photo_meta").put({
          photoId: `protasset::${protocolId}::${asset.assetKey}`,
          protocolId,
          assetKey: asset.assetKey,
          mimeType: blob.type || "application/octet-stream",
          sizeBytes: blob.size,
          blob,
          importedAt: nowIso,
          sourceFileName: asset.assetKey
        });
      }

      await waitTx(tx);

      window.localStorage.setItem(
        "capd-support:home:slots:v1",
        JSON.stringify(slotsSeed)
      );

      window.localStorage.setItem(
        "capd-support:home:active-session:v1",
        JSON.stringify({
          sessionId: seed.sessionId,
          slotIndex: seed.slotIndex,
          currentStepId: seed.currentStepId,
          protocolId,
          snapshotHash: "h_seed",
          mode: "runtime",
          updatedAtIso: nowIso
        })
      );
    },
    {
      input,
      nowIso: now,
      dateLocalIso: dateLocal,
      steps: STEPS,
      stepImageSeed: input.stepImageByStepId ?? {},
      protocolAssetsSeed: input.protocolAssets ?? [],
      storeNames: STORE_NAMES,
      slotsSeed: slots
    }
  );
}
