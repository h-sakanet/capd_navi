"use client";

import Link from "next/link";
import { ArrowLeft } from "@mynaui/icons-react";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  hasLegacyProtocolTemplates,
  upsertProtocolTemplate
} from "@/components/capd/protocol-template-store";
import {
  collectDirectChildFiles,
  findSelectedFileByAssetKey,
  validateCsvImport,
  validateReferencedImages,
  type CsvImportResult
} from "@/lib/csv-import";
import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ImportStatus = "idle" | "validating" | "failed" | "succeeded";

function toProtocolName(fileName: string): string {
  const trimmed = fileName.trim();
  return trimmed.replace(/\.csv$/i, "") || "protocol";
}

function parseCsvPreviewRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];

    if (ch === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r" && csvText[i + 1] === "\n") {
        i += 1;
      }
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((line) => line.some((value) => value.length > 0));
}

async function listDirectChildFilesFromDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of handle.values()) {
    if (entry.kind !== "file") {
      continue;
    }
    files.push(await entry.getFile());
  }
  return files;
}

export default function CsvImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDirectoryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [hasSelectedImageDirectory, setHasSelectedImageDirectory] = useState(false);
  const [selectedImageFilesByName, setSelectedImageFilesByName] = useState<Map<string, File>>(new Map());
  const [imageValidation, setImageValidation] = useState<{ missing: string[]; matched: string[] } | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [validation, setValidation] = useState<CsvImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const directoryInput = imageDirectoryInputRef.current;
    if (!directoryInput) {
      return;
    }
    directoryInput.setAttribute("webkitdirectory", "");
    directoryInput.setAttribute("directory", "");
  }, [selectedFileName]);

  const validate = useCallback((nextCsvText: string): CsvImportResult | null => {
    setStatus("validating");
    try {
      const result = validateCsvImport(nextCsvText);
      setValidation(result);
      setErrorMessage(null);
      setStatus("succeeded");
      return result;
    } catch (error) {
      setValidation(null);
      setErrorMessage(error instanceof Error ? error.message : "CSV検証に失敗しました。");
      setStatus("failed");
      return null;
    }
  }, []);

  const handleSelectCsvClick = () => {
    fileInputRef.current?.click();
  };

  const applySelectedImageFiles = useCallback(
    (selectedFiles: Map<string, File>, folderName: string | null) => {
      setHasSelectedImageDirectory(true);
      setSelectedFolderName(folderName || "選択済み");
      setSelectedImageFilesByName(selectedFiles);
      setErrorMessage(null);
      setSuccessMessage(null);

      const referencedImages = validation?.referencedImages ?? [];
      setImageValidation(validateReferencedImages(referencedImages, Array.from(selectedFiles.keys())));
    },
    [validation]
  );

  const handleSelectImageDirectoryClick = async () => {
    if (typeof window !== "undefined" && typeof window.showDirectoryPicker === "function") {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        const files = await listDirectChildFilesFromDirectoryHandle(directoryHandle);
        const selectedFiles = collectDirectChildFiles(files);
        applySelectedImageFiles(selectedFiles, directoryHandle.name || "選択済み");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setStatus("failed");
        setErrorMessage("画像フォルダの選択に失敗しました。");
        setSuccessMessage(null);
      }
      return;
    }

    imageDirectoryInputRef.current?.click();
  };

  const handleCsvSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const nextCsvText = await selectedFile.text();
    setSelectedFileName(selectedFile.name);
    setCsvText(nextCsvText);
    setSelectedFolderName(null);
    setHasSelectedImageDirectory(false);
    setSelectedImageFilesByName(new Map());
    setImageValidation(null);
    setSuccessMessage(null);
    const nextValidation = validate(nextCsvText);
    if (nextValidation?.referencedImages.length === 0) {
      setImageValidation({ missing: [], matched: [] });
    }
    event.target.value = "";
  };

  const handleImageDirectorySelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    const selectedFiles = collectDirectChildFiles(files);
    const firstRelativePath = Array.from(files).find((file) => {
      const withRelativePath = file as File & { webkitRelativePath?: string };
      return typeof withRelativePath.webkitRelativePath === "string" && withRelativePath.webkitRelativePath.length > 0;
    }) as (File & { webkitRelativePath?: string }) | undefined;
    const firstFolderName = firstRelativePath?.webkitRelativePath?.split("/")[0]?.trim();

    applySelectedImageFiles(selectedFiles, firstFolderName || "選択済み");
    event.target.value = "";
  };

  const handleSave = async () => {
    if (!csvText) {
      setStatus("failed");
      setErrorMessage("CSVファイルを選択してください。");
      setSuccessMessage(null);
      return;
    }

    const nextValidation = validate(csvText);
    if (!nextValidation) {
      setSuccessMessage(null);
      return;
    }

    const referencedImages = nextValidation.referencedImages;
    let nextImageValidation = imageValidation;
    if (referencedImages.length > 0) {
      if (!hasSelectedImageDirectory) {
        setStatus("failed");
        setErrorMessage("画像の格納先を選択してください。");
        setSuccessMessage(null);
        return;
      }

      nextImageValidation = validateReferencedImages(referencedImages, Array.from(selectedImageFilesByName.keys()));
      setImageValidation(nextImageValidation);
      if (nextImageValidation.missing.length > 0) {
        setStatus("failed");
        setErrorMessage("不足している画像があります。画像の格納先を再指定してください。");
        setSuccessMessage(null);
        return;
      }
    }

    try {
      const protocolName = toProtocolName(selectedFileName ?? "protocol.csv");
      const importedAt = new Date().toISOString();
      await upsertProtocolTemplate({
        protocolId: protocolName,
        protocolName,
        importedAt,
        stepCount: nextValidation.stepCount,
        steps: nextValidation.steps,
        assets: (nextImageValidation?.matched ?? []).map((assetKey) => {
          const source = findSelectedFileByAssetKey(selectedImageFilesByName, assetKey);
          if (!source) {
            throw new Error(`画像が不足しています: ${assetKey}`);
          }
          return {
            assetKey,
            mimeType: source.type || "application/octet-stream",
            sizeBytes: source.size,
            blob: source,
            importedAt,
            sourceFileName: source.name
          };
        }),
        validationReport: {
          errors: [],
          warnings: []
        }
      });

      setSuccessMessage(`取り込み成功: ${nextValidation.stepCount} ステップを保存しました。`);
      setErrorMessage(null);
    } catch (error) {
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "保存に失敗しました。");
      setSuccessMessage(null);
    }
  };

  const referencedImageCount = validation?.referencedImages.length ?? 0;
  const missingImages = imageValidation?.missing ?? [];
  const matchedImages = imageValidation?.matched ?? [];
  const csvPreviewRows = selectedFileName ? parseCsvPreviewRows(csvText) : [];
  const canSave =
    Boolean(selectedFileName) &&
    status !== "validating" &&
    Boolean(validation) &&
    (referencedImageCount === 0 || (hasSelectedImageDirectory && missingImages.length === 0));

  return (
    <CapdShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">手技テンプレート取り込み</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0" aria-busy={status === "validating"}>
          {hasLegacyProtocolTemplates() ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              旧テンプレート形式のデータを検出しました。CSVを再取り込みして最新形式へ更新してください。
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={handleSelectCsvClick}>
              CSVファイルを選択
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              aria-label="CSVファイル入力"
              onChange={handleCsvSelected}
            />
          </div>

          {status === "validating" ? (
            <p role="status" className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              検証中...
            </p>
          ) : null}

          {selectedFileName ? (
            <>
              <div className="space-y-1.5">
                <p className="text-sm font-medium" data-testid="selected-csv-title">
                  {selectedFileName}
                </p>
                {validation ? (
                  <p className="text-sm text-muted-foreground" data-testid="import-summary">
                    {`検証結果: ${validation.stepCount} ステップ / timer ${validation.timerCount} / alarm ${validation.alarmCount} / record ${validation.recordEventCount}`}
                  </p>
                ) : null}
                <div className="max-h-[320px] overflow-auto rounded-md border">
                  <table className="w-full border-collapse text-xs" data-testid="import-csv-preview-table">
                    <tbody>
                      {csvPreviewRows.map((row, rowIndex) => (
                        <tr key={`${rowIndex}-${row.join(",")}`} className="border-b align-top">
                          {row.map((cell, colIndex) => {
                            const isHeader = rowIndex === 0;
                            if (isHeader) {
                              return (
                                <th
                                  key={`${rowIndex}-${colIndex}`}
                                  className="min-w-[140px] border-r bg-muted/50 px-2 py-1 text-left font-medium"
                                  scope="col"
                                >
                                  {cell}
                                </th>
                              );
                            }
                            return (
                              <td key={`${rowIndex}-${colIndex}`} className="min-w-[140px] border-r px-2 py-1 whitespace-pre-wrap">
                                {cell}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-dashed p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleSelectImageDirectoryClick}>
                    画像の格納先を選ぶ
                  </Button>
                  <input
                    ref={imageDirectoryInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    aria-label="画像フォルダ入力"
                    onChange={handleImageDirectorySelected}
                  />
                  {selectedFolderName ? (
                    <p className="text-sm text-muted-foreground">{`選択フォルダ: ${selectedFolderName}`}</p>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground" data-testid="import-image-summary">
                  {`画像照合: 参照 ${referencedImageCount} / 一致 ${matchedImages.length}`}
                </p>
                {missingImages.length > 0 ? (
                  <div
                    className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                    data-testid="missing-image-warning"
                  >
                    <p className="font-medium">不足している画像があります。</p>
                    <ul className="mt-1 list-inside list-disc">
                      {missingImages.map((imageName) => (
                        <li key={imageName}>{imageName}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/capd/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Homeへ戻る
              </Link>
            </Button>
            {selectedFileName ? (
              <Button onClick={() => void handleSave()} disabled={!canSave}>
                保存
              </Button>
            ) : null}
          </div>

          {successMessage ? (
            <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </CapdShell>
  );
}
