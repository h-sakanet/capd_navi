"use client";

import Link from "next/link";
import { ArrowLeft } from "@mynaui/icons-react";
import { useMemo, useState } from "react";

import { normalizeImageList, validateCsvImport } from "@/lib/csv-import";
import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TEMPLATE_STORAGE_KEY = "capd-support:templates:v1";

const defaultCsv = [
  "row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit",
  "meta,format_version,3,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_id,sample-protocol,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_name,サンプル,,,,,,,,,,,,,,,,,,,,,",
  "meta,protocol_version,v1.0.0,,,,,,,,,,,,,,,,,,,,,",
  "meta,effective_from_local,2026-02-11T00:00:00+09:00,,,,,,,,,,,,,,,,,,,,,",
  "step,,,1,step_001,step_002,事前準備,お腹-独立,開始,img-1.png,表示テキスト,,,,,,,,,,,,",
  "step,,,2,step_002,,終了,お腹-独立,終了,img-2.png,表示テキスト,,,,,,,,,,,,"
].join("\n");

export default function CsvImportPage() {
  const [csvText, setCsvText] = useState(defaultCsv);
  const [imagesText, setImagesText] = useState("img-1.png,img-2.png");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const imageList = useMemo(() => normalizeImageList(imagesText), [imagesText]);

  const handleValidateAndSave = () => {
    try {
      const result = validateCsvImport(csvText, imageList);
      const nowIso = new Date().toISOString();
      const current = typeof window === "undefined" ? [] : JSON.parse(window.localStorage.getItem(TEMPLATE_STORAGE_KEY) ?? "[]");
      const next = [
        ...current,
        {
          id: `template_${Date.now()}`,
          importedAt: nowIso,
          stepCount: result.stepCount
        }
      ];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
      }

      setErrorMessage(null);
      setSuccessMessage(`取り込み成功: ${result.stepCount} ステップを保存しました。`);
    } catch (error) {
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "CSV検証に失敗しました。");
    }
  };

  return (
    <CapdShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">CSV取込（Mac）</CardTitle>
          <CardDescription>protocol.csv と画像一覧を検証し、テンプレートとしてローカル保存します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="csv-text">
              protocol.csv 内容
            </label>
            <textarea
              id="csv-text"
              className="min-h-[220px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="image-list">
              画像ファイル一覧（カンマ/改行区切り）
            </label>
            <textarea
              id="image-list"
              className="min-h-[84px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={imagesText}
              onChange={(event) => setImagesText(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleValidateAndSave}>検証して保存</Button>
            <Button asChild variant="outline">
              <Link href="/capd/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Homeへ戻る
              </Link>
            </Button>
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
