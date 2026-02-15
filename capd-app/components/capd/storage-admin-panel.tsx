"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ja } from "react-day-picker/locale";

import {
  buildStorageExportJson,
  clearAllStorage,
  deleteStorageTargets,
  loadStorageSnapshot,
  toStorageDeleteTarget
} from "@/lib/storage-admin";
import type { StorageFilterScope, StoragePreviewItem, StorageSnapshot } from "@/lib/storage-admin.types";
import { getAppDateOverrideDateLocal, setAppDateOverrideDateLocal, toDateLocalJst } from "@/lib/storage/time";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ConfirmState =
  | {
      mode: "delete";
      items: StoragePreviewItem[];
    }
  | {
      mode: "clear";
    }
  | null;

function filterByScope(item: StoragePreviewItem, scope: StorageFilterScope): boolean {
  if (scope === "all") {
    return true;
  }
  if (scope === "local") {
    return item.scope === "local";
  }
  return item.scope === "indexeddb_database" || item.scope === "indexeddb_store";
}

function normalizeQuery(input: string): string {
  return input.trim().toLowerCase();
}

function matchesSearch(item: StoragePreviewItem, query: string): boolean {
  if (!query) {
    return true;
  }

  return [item.key, item.dbName ?? "", item.storeName ?? "", item.previewText].some((value) =>
    value.toLowerCase().includes(query)
  );
}

function scopeLabel(scope: StoragePreviewItem["scope"]): string {
  if (scope === "local") {
    return "local";
  }
  if (scope === "indexeddb_database") {
    return "idb-db";
  }
  return "idb-store";
}

function toJstDateFromDateLocal(dateLocal: string): Date {
  const parsed = new Date(`${dateLocal}T00:00:00+09:00`);
  if (!Number.isFinite(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function ConfirmDialog({
  title,
  description,
  children,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmLabel
}: {
  title: string;
  description: string;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  confirmLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={confirmDisabled}>
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StorageAdminPanel() {
  const [snapshot, setSnapshot] = useState<StorageSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scope, setScope] = useState<StorageFilterScope>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [appDateLocal, setAppDateLocal] = useState<string>(() => getAppDateOverrideDateLocal() ?? toDateLocalJst());
  const [appDateSelected, setAppDateSelected] = useState<Date>(() => toJstDateFromDateLocal(getAppDateOverrideDateLocal() ?? toDateLocalJst()));
  const todayInJst = useMemo(() => toJstDateFromDateLocal(toDateLocalJst(new Date())), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const next = await loadStorageSnapshot();
      setSnapshot(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ストレージ情報の読み込みに失敗しました。");
      setSnapshot({ items: [], warnings: [], generatedAtIso: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredItems = useMemo(() => {
    const allItems = snapshot?.items ?? [];
    const normalized = normalizeQuery(query);
    return allItems.filter((item) => filterByScope(item, scope) && matchesSearch(item, normalized));
  }, [query, scope, snapshot?.items]);

  useEffect(() => {
    if (!filteredItems.length) {
      setActiveId(null);
      return;
    }

    if (!activeId || !filteredItems.some((item) => item.id === activeId)) {
      setActiveId(filteredItems[0].id);
    }
  }, [activeId, filteredItems]);

  const activeItem = useMemo(() => {
    if (!activeId) {
      return null;
    }
    return filteredItems.find((item) => item.id === activeId) ?? null;
  }, [activeId, filteredItems]);

  const selectedItems = useMemo(() => {
    const allItems = snapshot?.items ?? [];
    return allItems.filter((item) => selectedIds.has(item.id));
  }, [selectedIds, snapshot?.items]);

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        filteredItems.forEach((item) => next.add(item.id));
      } else {
        filteredItems.forEach((item) => next.delete(item.id));
      }
      return next;
    });
  };

  const handleDelete = async (items: StoragePreviewItem[]) => {
    const targets = items.map(toStorageDeleteTarget).filter((item): item is NonNullable<typeof item> => item !== null);
    if (!targets.length) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    try {
      await deleteStorageTargets(targets);
      setSelectedIds((current) => {
        const next = new Set(current);
        items.forEach((item) => next.delete(item.id));
        return next;
      });
      setConfirmState(null);
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "削除処理に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleClearAll = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await clearAllStorage();
      setConfirmState(null);
      setClearConfirmText("");
      setSelectedIds(new Set());
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "全削除に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    if (!snapshot) {
      return;
    }

    const text = buildStorageExportJson(snapshot);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `storage-snapshot-${new Date().toISOString()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const applyAppDate = useCallback(
    async (nextDateLocal: string | null) => {
      try {
        setAppDateOverrideDateLocal(nextDateLocal);
        const resolvedDateLocal = nextDateLocal ?? toDateLocalJst(new Date());
        setAppDateLocal(resolvedDateLocal);
        setAppDateSelected(toJstDateFromDateLocal(resolvedDateLocal));
        setErrorMessage(null);
        await refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "アプリ内日付の更新に失敗しました。");
      }
    },
    [refresh]
  );

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        return;
      }
      const dateLocal = toDateLocalJst(date);
      void applyAppDate(dateLocal);
    },
    [applyAppDate]
  );

  const hasItems = (snapshot?.items.length ?? 0) > 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Storage Admin (Dev/Test)</CardTitle>
              <CardDescription className="mt-1">URL: /capd/dev/storage-admin</CardDescription>
            </div>
            <p className="rounded-full border px-3 py-1 text-xs font-medium text-emerald-700">ENV: ENABLED</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading || busy}>
              Refresh
            </Button>
            <Button type="button" variant="outline" onClick={handleExport} disabled={!snapshot || loading || busy}>
              Export JSON
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="grid gap-3 md:grid-cols-[200px_1fr]">
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">アプリ内日付（テスト用）</p>
              <p className="text-sm text-muted-foreground" data-testid="app-date-local">
                {`現在のアプリ内日付: ${appDateLocal}`}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void applyAppDate(null)} disabled={loading || busy}>
                  今日に戻す
                </Button>
              </div>
              <div className="max-w-sm">
                <Calendar
                  key={appDateLocal}
                  className="rounded-md border"
                  mode="single"
                  selected={appDateSelected}
                  onSelect={handleCalendarSelect}
                  defaultMonth={appDateSelected}
                  today={todayInJst}
                  navLayout="around"
                  captionLayout="dropdown"
                  locale={ja}
                />
              </div>
            </div>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Filter</span>
              <select
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={scope}
                onChange={(event) => setScope(event.target.value as StorageFilterScope)}
              >
                <option value="all">All</option>
                <option value="local">localStorage</option>
                <option value="indexeddb">IndexedDB</option>
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Search</span>
              <input
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="key / db / store"
              />
            </label>
          </div>

          {snapshot?.warnings.length ? (
            <div className="space-y-2">
              {snapshot.warnings.map((warning) => (
                <p key={warning} role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {warning}
                </p>
              ))}
            </div>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-medium">一覧</p>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id))}
                    onChange={(event) => handleSelectAllFiltered(event.target.checked)}
                  />
                  表示中を全選択
                </label>
              </div>

              <div className="max-h-[440px] overflow-auto">
                {loading ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">読み込み中...</p>
                ) : !hasItems ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground" data-testid="storage-empty">
                    削除対象データはありません。
                  </p>
                ) : !filteredItems.length ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">条件に一致するデータがありません。</p>
                ) : (
                  <ul className="divide-y">
                    {filteredItems.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          "cursor-pointer px-3 py-2 transition-colors",
                          activeId === item.id ? "bg-muted" : "hover:bg-muted/50"
                        )}
                        data-testid={`storage-row-${item.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                        onClick={() => setActiveId(item.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={(event) => toggleSelected(item.id, event.target.checked)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`select-${item.id}`}
                            />
                            <span>
                              <span className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">{scopeLabel(item.scope)}</span>
                              <span className="ml-2 break-all font-medium">{item.key}</span>
                            </span>
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              setConfirmState({ mode: "delete", items: [item] });
                            }}
                            disabled={busy}
                            aria-label={`削除 ${item.key}`}
                          >
                            削除
                          </Button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {typeof item.sizeBytes === "number" ? `size: ${item.sizeBytes} bytes` : null}
                          {typeof item.sizeBytes === "number" && typeof item.recordCount === "number" ? " / " : null}
                          {typeof item.recordCount === "number" ? `count: ${item.recordCount}` : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">詳細プレビュー</p>
              </div>
              <div className="space-y-3 px-3 py-3">
                {!activeItem ? (
                  <p className="text-sm text-muted-foreground">左の一覧から対象を選択してください。</p>
                ) : (
                  <>
                    <div className="space-y-1 text-sm">
                      <p className="break-all font-medium">対象: {activeItem.key}</p>
                      <p className="text-muted-foreground">Type: {scopeLabel(activeItem.scope)}</p>
                      {activeItem.dbName ? <p className="text-muted-foreground">DB: {activeItem.dbName}</p> : null}
                      {activeItem.storeName ? <p className="text-muted-foreground">Store: {activeItem.storeName}</p> : null}
                    </div>
                    <pre className="max-h-[360px] overflow-auto rounded-md border bg-muted/20 p-3 text-xs leading-relaxed">
                      {activeItem.previewText || "(empty)"}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!selectedItems.length || busy}
              onClick={() => setConfirmState({ mode: "delete", items: selectedItems })}
            >
              Delete Selected
            </Button>
            <Button type="button" variant="destructive" disabled={busy} onClick={() => setConfirmState({ mode: "clear" })}>
              Clear ALL Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      {confirmState?.mode === "delete" ? (
        <ConfirmDialog
          title="選択データを削除"
          description="選択したデータを削除します。この操作は取り消せません。"
          onCancel={() => setConfirmState(null)}
          onConfirm={() => void handleDelete(confirmState.items)}
          confirmLabel={confirmState.items.length === 1 ? "削除する" : `${confirmState.items.length} 件を削除する`}
          confirmDisabled={busy}
        >
          <div className="max-h-44 space-y-1 overflow-auto rounded-md border bg-muted/20 p-2 text-sm">
            {confirmState.items.map((item) => (
              <p key={item.id} className="break-all">{`${scopeLabel(item.scope)}: ${item.key}`}</p>
            ))}
          </div>
        </ConfirmDialog>
      ) : null}

      {confirmState?.mode === "clear" ? (
        <ConfirmDialog
          title="全ストレージ削除"
          description="localStorage と IndexedDB のデータを削除します（CSVテンプレートとスロット登録は保持されます）。"
          onCancel={() => {
            setConfirmState(null);
            setClearConfirmText("");
          }}
          onConfirm={() => void handleClearAll()}
          confirmLabel="全削除を実行"
          confirmDisabled={busy || clearConfirmText !== "DELETE"}
        >
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">確認のため DELETE と入力してください</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={clearConfirmText}
              onChange={(event) => setClearConfirmText(event.target.value)}
              placeholder="DELETE"
            />
          </label>
        </ConfirmDialog>
      ) : null}
    </>
  );
}
