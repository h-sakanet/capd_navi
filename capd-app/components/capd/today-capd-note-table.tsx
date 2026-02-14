import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { type HomeNoteEntity, type HomeExchangeNote } from "@/lib/storage/models";
import { calculateHomeDailyUfTotal, calculateHomeExchangeUf } from "@/lib/services/home-note-calc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/format";
import { saveHomeExchange, saveHomeSummary } from "@/lib/services/home-note-mutation";
import { createEmptyHomeNote } from "@/lib/services/home-note-query";
import { DrainAppearanceSelect, ExitSiteStatusCheckboxes } from "@/components/capd/capd-record-fields";
import { validateTime } from "@/lib/capd-validation";

type Props = {
  dateLocal: string;
  note: HomeNoteEntity | null;
  onSave?: () => void;
  disabled?: boolean;
  title?: React.ReactNode;
};

const exchangeColumns = [1, 2, 3, 4, 5] as const;
const headerItemClass = "sticky left-0 z-10 bg-background h-8 w-28 px-2 py-1 text-sm whitespace-nowrap";
const headerColumnClass = "h-8 min-w-[124px] px-2 py-1 text-left text-sm whitespace-nowrap";
const rowLabelClass = "sticky left-0 z-10 bg-background px-2 py-1.5 text-sm font-normal text-muted-foreground whitespace-nowrap shadow-[1px_0_0_hsl(var(--border))]";
const rowValueClass = "px-2 py-1.5 text-sm font-semibold whitespace-nowrap";

// 定数は @/lib/capd-constants および @/lib/capd-validation から import

function tableValueClass(value: string): string {
  return cn(rowValueClass, (value === "—" || value === "未計算") && "font-normal text-muted-foreground");
}


function summaryValueClass(value: any): string {
  const isEmpty = value === null || value === undefined || value === "" || value === "—" || value === "未計算";
  return cn("text-sm", isEmpty ? "font-normal text-muted-foreground" : "font-semibold");
}

export function TodayCapdNoteTable({ dateLocal, note, onSave, disabled, title }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<HomeNoteEntity | null>(null);

  // Sync editingNote with prop when starting edit or when prop changes (if not editing)
  useEffect(() => {
    if (note) {
      setEditingNote(JSON.parse(JSON.stringify(note)));
    } else {
      setEditingNote(createEmptyHomeNote(dateLocal));
    }
  }, [note, dateLocal]);

  const dailyUfTotalG = isEditing && editingNote
    ? calculateHomeDailyUfTotal(editingNote)
    : note
      ? calculateHomeDailyUfTotal(note)
      : null;

  const toggleEdit = () => {
    if (isEditing) {
      // Cancelled, revert
      if (note) {
        setEditingNote(JSON.parse(JSON.stringify(note)));
      } else {
        setEditingNote(createEmptyHomeNote(dateLocal));
      }
    } else {
      // Start editing: ensure editingNote is initialized
      if (!editingNote) {
        setEditingNote(note ? JSON.parse(JSON.stringify(note)) : createEmptyHomeNote(dateLocal));
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (exchangeNo: number, field: keyof HomeExchangeNote, value: any) => {
    setEditingNote((prev) => {
      if (!prev) return null;
      const newExchanges = prev.exchanges.map((ex) => {
        if (ex.exchangeNo === exchangeNo) {
          return { ...ex, [field]: value };
        }
        return ex;
      });
      return { ...prev, exchanges: newExchanges };
    });
  };

  const handleSummaryChange = (field: keyof HomeNoteEntity["summary"], value: any) => {
    setEditingNote((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        summary: {
          ...prev.summary,
          [field]: value
        }
      };
    });
  };

  // validateTime は @/lib/capd-validation から import

  const handleSave = async () => {
    console.log("handleSave called", { editingNote, note });
    if (!editingNote) return;

    // Use dateLocal from editingNote or props
    const activeDateLocal = editingNote.dateLocal || dateLocal;

    // Validation
    for (const ex of editingNote.exchanges) {
      if (!validateTime(ex.dwellStart) && ex.dwellStart !== "") {
        console.warn("Validation failed: dwellStart", ex.dwellStart);
        alert(`項目 #${ex.exchangeNo} の貯留開始時間が不正です。HH:MM形式で入力してください。`);
        return;
      }
      if (!validateTime(ex.dwellEnd) && ex.dwellEnd !== "") {
        console.warn("Validation failed: dwellEnd", ex.dwellEnd);
        alert(`項目 #${ex.exchangeNo} の貯留終了時間が不正です。HH:MM形式で入力してください。`);
        return;
      }
      if (!validateTime(ex.drainStart) && ex.drainStart !== "") {
        console.warn("Validation failed: drainStart", ex.drainStart);
        alert(`項目 #${ex.exchangeNo} の排液開始時間が不正です。HH:MM形式で入力してください。`);
        return;
      }
      if (!validateTime(ex.drainEnd) && ex.drainEnd !== "") {
        console.warn("Validation failed: drainEnd", ex.drainEnd);
        alert(`項目 #${ex.exchangeNo} の排液終了時間が不正です。HH:MM形式で入力してください。`);
        return;
      }

      // Numeric validations (positive numbers or zero)
      if (ex.drainWeightG !== null && ex.drainWeightG < 0) {
        alert(`項目 #${ex.exchangeNo} の排液量(g)は0以上の数値を入力してください。`);
        return;
      }
      if (ex.bagWeightG !== null && ex.bagWeightG < 0) {
        alert(`項目 #${ex.exchangeNo} の注液量(g)は0以上の数値を入力してください。`);
        return;
      }
    }

    if (editingNote.summary) {
      const s = editingNote.summary;
      if (s.bodyWeightKg !== null && s.bodyWeightKg <= 0) {
        alert("体重は0より大きい数値を入力してください。");
        return;
      }
      if (s.urineMl !== null && s.urineMl < 0) {
        alert("尿量は0以上の数値を入力してください。");
        return;
      }
      if (s.fluidIntakeMl !== null && s.fluidIntakeMl < 0) {
        alert("飲水量は0以上の数値を入力してください。");
        return;
      }
      if (s.stoolCountPerDay !== null && s.stoolCountPerDay < 0) {
        alert("排便回数は0以上の数値を入力してください。");
        return;
      }
      if (s.bpSys !== null && s.bpSys <= 0) {
        alert("血圧(上)は0より大きい数値を入力してください。");
        return;
      }
      if (s.bpDia !== null && s.bpDia <= 0) {
        alert("血圧(下)は0より大きい数値を入力してください。");
        return;
      }
    }

    // Save changes
    const promises = [];
    for (const editEx of editingNote.exchanges) {
      const originalEx = note?.exchanges.find((e) => e.exchangeNo === editEx.exchangeNo);
      // If there was no original, any field with value is an update

      const updates: Partial<HomeExchangeNote> = {};
      let hasUpdates = false;

      // Check fields for changes
      const fields: (keyof HomeExchangeNote)[] = [
        "dwellStart", "dwellEnd", "csvTitle",
        "drainWeightG", "bagWeightG", "drainStart", "drainEnd", "drainAppearance"
      ];

      for (const field of fields) {
        const editVal = editEx[field];
        const originalVal = originalEx ? originalEx[field] : undefined;

        if (editVal !== originalVal && (editVal !== "" || originalVal !== undefined)) {
          // @ts-ignore
          updates[field] = editVal;
          hasUpdates = true;
          console.log(`Field changed: #${editEx.exchangeNo} ${field}`, { from: originalVal, to: editVal });
        }
      }

      if (hasUpdates) {
        // If no sessionId, we might need to create one, but usually it comes from high-level session.
        // For manual edits on a day with no data, we might need a generic sessionId or handle it in repo.
        // Actually saveHomeExchange expects sessionId.
        const targetSessionId = editEx.sessionId || `manual-${activeDateLocal}`;
        console.log("Queueing save for", targetSessionId, updates);
        promises.push(saveHomeExchange(targetSessionId, activeDateLocal, editEx.exchangeNo, updates));
      }
    }

    // Check summary changes
    if (editingNote.summary) {
      const originalSummary = note?.summary || createEmptyHomeNote(activeDateLocal).summary;
      let hasSummaryUpdates = false;

      const summaryFields: (keyof HomeNoteEntity["summary"])[] = [
        "bodyWeightKg", "urineMl", "fluidIntakeMl", "stoolCountPerDay", "bpSys", "bpDia", "exitSiteStatus", "notes"
      ];

      for (const field of summaryFields) {
        if (editingNote.summary[field] !== originalSummary[field]) {
          hasSummaryUpdates = true;
          break;
        }
      }

      if (hasSummaryUpdates) {
        // Find best sessionId to attribute summary to
        const primarySessionId = editingNote.exchanges.find(ex => ex.sessionId)?.sessionId || `manual-${activeDateLocal}`;
        console.log("Queueing full summary save for", primarySessionId, editingNote.summary);
        // Send the FULL summary object to ensure no fields are wiped
        promises.push(saveHomeSummary(primarySessionId, activeDateLocal, {
          bodyWeightKg: editingNote.summary.bodyWeightKg,
          urineMl: editingNote.summary.urineMl,
          fluidIntakeMl: editingNote.summary.fluidIntakeMl,
          stoolCountPerDay: editingNote.summary.stoolCountPerDay,
          bpSys: editingNote.summary.bpSys,
          bpDia: editingNote.summary.bpDia,
          exitSiteStatus: editingNote.summary.exitSiteStatus,
          notes: editingNote.summary.notes
        }));
      }
    }

    console.log("Promises to execute:", promises.length);

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        console.log("All IndexedDB promises resolved successfully");

        if (onSave) {
          console.log("Triggering parent refresh (onSave)...");
          // Use 'any' cast to workaround potential type definition mismatch
          await (onSave() as any);
          console.log("Parent refresh completed");
        }
      } catch (e) {
        console.error("Critical error during handleSave - background promises failed:", e);
        alert("保存中にエラーが発生しました。詳細はブラウザのコンソールを確認してください。");
        return;
      }
    } else {
      console.log("No changes detected in exchanges or summary. Skipping DB operations.");
    }

    console.log("Exiting edit mode and confirming with UI state change.");
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {title ? <div className="text-lg font-medium">{title}</div> : <div />}
        <div className="flex justify-end">
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={toggleEdit}>
                <X className="h-4 w-4" />
                <span className="sr-only">キャンセル</span>
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4" />
                <span className="sr-only">保存</span>
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleEdit}
              disabled={disabled}
              title={disabled ? "すべての手順を完了してから編集してください" : "編集"}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headerItemClass}>項目</TableHead>
              {exchangeColumns.map((columnNo) => (
                <TableHead key={`column-${columnNo}`} className={headerColumnClass}>
                  #{columnNo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>貯留時間</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const start = exchange?.dwellStart || "";
                const end = exchange?.dwellEnd || "";

                return (
                  <TableCell key={`dwell-${columnNo}`} className={tableValueClass(start && end ? `${start}〜${end}` : "—")}>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 w-16 px-1 text-xs"
                          value={start}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(columnNo, "dwellStart", e.target.value)}
                          placeholder="00:00"
                        />
                        <span>〜</span>
                        <Input
                          className="h-7 w-16 px-1 text-xs"
                          value={end}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(columnNo, "dwellEnd", e.target.value)}
                          placeholder="00:00"
                        />
                      </div>
                    ) : (
                      start && end ? `${start}〜${end}` : "—"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>透析液濃度</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const value = exchange?.csvTitle || "";
                return (
                  <TableCell key={`conc-${columnNo}`} className={tableValueClass(value || "—")}>
                    {isEditing ? (
                      <Input
                        className="h-7 min-w-[100px] px-2 text-xs"
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(columnNo, "csvTitle", e.target.value)}
                      />
                    ) : (
                      value || "—"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>排液量</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const rawValue = exchange?.drainWeightG;
                const value = rawValue !== null && rawValue !== undefined ? `${rawValue} g` : "—";
                return (
                  <TableCell key={`drain-${columnNo}`} className={tableValueClass(value)}>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="h-7 w-20 px-2 text-xs"
                          value={rawValue ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            handleInputChange(columnNo, "drainWeightG", val);
                          }}
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    ) : (
                      value
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>注液量</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const rawValue = exchange?.bagWeightG;
                const value = rawValue !== null && rawValue !== undefined ? `${rawValue} g` : "—";
                return (
                  <TableCell key={`infuse-${columnNo}`} className={tableValueClass(value)}>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="h-7 w-20 px-2 text-xs"
                          value={rawValue ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            handleInputChange(columnNo, "bagWeightG", val);
                          }}
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    ) : (
                      value
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>除水量</TableCell>
              {exchangeColumns.map((columnNo) => {
                const uf = editingNote ? calculateHomeExchangeUf(editingNote, columnNo) : null;
                const value = uf === null ? "未計算" : `${formatSigned(uf)} g`;
                return (
                  <TableCell key={`uf-${columnNo}`} className={tableValueClass(value)}>
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>排液時間</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const start = exchange?.drainStart || "";
                const end = exchange?.drainEnd || "";

                return (
                  <TableCell key={`drain-time-${columnNo}`} className={tableValueClass(start && end ? `${start}〜${end}` : "—")}>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 w-16 px-1 text-xs"
                          value={start}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(columnNo, "drainStart", e.target.value)}
                          placeholder="00:00"
                        />
                        <span>〜</span>
                        <Input
                          className="h-7 w-16 px-1 text-xs"
                          value={end}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(columnNo, "drainEnd", e.target.value)}
                          placeholder="00:00"
                        />
                      </div>
                    ) : (
                      start && end ? `${start}〜${end}` : "—"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell className={rowLabelClass}>排液の確認</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = editingNote?.exchanges.find((item) => item.exchangeNo === columnNo);
                const value = exchange?.drainAppearance || "";
                return (
                  <TableCell key={`appearance-${columnNo}`} className={tableValueClass(value || "—")}>
                    {isEditing ? (
                      <DrainAppearanceSelect
                        value={value}
                        onChange={(v) => handleInputChange(columnNo, "drainAppearance", v)}
                        className="h-7 w-full min-w-[100px] rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    ) : (
                      value || "—"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">1日の総除水量</p>
          <p className={summaryValueClass(dailyUfTotalG)}>
            {dailyUfTotalG === null ? "—" : `${formatSigned(dailyUfTotalG)} g`}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">体重</p>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  step="0.1"
                  className="h-7 w-20 px-2 text-xs"
                  value={editingNote?.summary.bodyWeightKg ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("bodyWeightKg", e.target.value === "" ? null : Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
            ) : (
              <p className={summaryValueClass(editingNote?.summary.bodyWeightKg ?? note?.summary.bodyWeightKg)}>
                {(editingNote?.summary.bodyWeightKg ?? note?.summary.bodyWeightKg) !== null && (editingNote?.summary.bodyWeightKg ?? note?.summary.bodyWeightKg) !== undefined
                  ? `${(editingNote?.summary.bodyWeightKg ?? note?.summary.bodyWeightKg)!.toFixed(1)} kg`
                  : "—"}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">尿量</p>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  className="h-7 w-20 px-2 text-xs"
                  value={editingNote?.summary.urineMl ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("urineMl", e.target.value === "" ? null : Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">ml</span>
              </div>
            ) : (
              <p className={summaryValueClass(editingNote?.summary.urineMl ?? note?.summary.urineMl)}>
                {(editingNote?.summary.urineMl ?? note?.summary.urineMl) !== null && (editingNote?.summary.urineMl ?? note?.summary.urineMl) !== undefined
                  ? `${editingNote?.summary.urineMl ?? note?.summary.urineMl} ml`
                  : "—"}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">飲水量</p>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  className="h-7 w-20 px-2 text-xs"
                  value={editingNote?.summary.fluidIntakeMl ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("fluidIntakeMl", e.target.value === "" ? null : Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">ml</span>
              </div>
            ) : (
              <p className={summaryValueClass(editingNote?.summary.fluidIntakeMl ?? note?.summary.fluidIntakeMl)}>
                {(editingNote?.summary.fluidIntakeMl ?? note?.summary.fluidIntakeMl) !== null && (editingNote?.summary.fluidIntakeMl ?? note?.summary.fluidIntakeMl) !== undefined
                  ? `${editingNote?.summary.fluidIntakeMl ?? note?.summary.fluidIntakeMl} ml`
                  : "—"}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">排便</p>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-baseline gap-1">
                <Input
                  type="number"
                  className="h-7 w-20 px-2 text-xs"
                  value={editingNote?.summary.stoolCountPerDay ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("stoolCountPerDay", e.target.value === "" ? null : Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">回</span>
              </div>
            ) : (
              <p className={summaryValueClass(editingNote?.summary.stoolCountPerDay ?? note?.summary.stoolCountPerDay)}>
                {(editingNote?.summary.stoolCountPerDay ?? note?.summary.stoolCountPerDay) !== null && (editingNote?.summary.stoolCountPerDay ?? note?.summary.stoolCountPerDay) !== undefined
                  ? `${editingNote?.summary.stoolCountPerDay ?? note?.summary.stoolCountPerDay} 回`
                  : "—"}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">血圧</p>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                className="h-7 w-16 px-1 text-xs"
                value={editingNote?.summary.bpSys ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("bpSys", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="上"
              />
              <span className="text-xs">/</span>
              <Input
                type="number"
                className="h-7 w-16 px-1 text-xs"
                value={editingNote?.summary.bpDia ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSummaryChange("bpDia", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="下"
              />
            </div>
          ) : (
            <p className={summaryValueClass(editingNote?.summary.bpSys ?? note?.summary.bpSys)}>
              {(editingNote?.summary.bpSys ?? note?.summary.bpSys) !== null &&
                (editingNote?.summary.bpSys ?? note?.summary.bpSys) !== undefined &&
                (editingNote?.summary.bpDia ?? note?.summary.bpDia) !== null &&
                (editingNote?.summary.bpDia ?? note?.summary.bpDia) !== undefined
                ? `${editingNote?.summary.bpSys ?? note?.summary.bpSys}/${editingNote?.summary.bpDia ?? note?.summary.bpDia}`
                : "—"}
            </p>
          )}
        </div>
        <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
          <p className="text-sm text-muted-foreground">出口部の状態</p>
          {isEditing ? (
            <div className="rounded-md border p-3">
              <ExitSiteStatusCheckboxes
                value={(editingNote?.summary.exitSiteStatus || "").split(", ").filter(Boolean)}
                onChange={(v) => handleSummaryChange("exitSiteStatus", v.join(", "))}
                exclusiveNormal
              />
            </div>
          ) : (
            <p className={summaryValueClass(editingNote?.summary.exitSiteStatus ?? note?.summary.exitSiteStatus)}>
              {editingNote?.summary.exitSiteStatus ?? note?.summary.exitSiteStatus ?? "—"}
            </p>
          )}
        </div>
        <div className="space-y-1 md:col-span-2 xl:col-span-3">
          <p className="text-sm text-muted-foreground">備考</p>
          {isEditing ? (
            <textarea
              className="min-h-[60px] w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              value={editingNote?.summary.notes ?? ""}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleSummaryChange("notes", e.target.value)}
            />
          ) : (
            <p className={summaryValueClass(editingNote?.summary.notes ?? note?.summary.notes)}>
              {editingNote?.summary.notes ?? note?.summary.notes ?? "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
