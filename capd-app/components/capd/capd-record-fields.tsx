"use client";

import { type ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { drainAppearanceOptions, exitSiteStatusOptions } from "@/lib/capd-constants";
import { normalizeNumericInput } from "@/lib/capd-validation";

/* ------------------------------------------------------------------ */
/*  DrainAppearanceSelect — 排液の確認セレクト                            */
/* ------------------------------------------------------------------ */

type DrainAppearanceSelectProps = {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    /** セレクト要素のclassName */
    className?: string;
};

export function DrainAppearanceSelect({
    value,
    onChange,
    id,
    className = "h-9 w-full rounded-md border bg-background px-3 text-sm"
}: DrainAppearanceSelectProps) {
    return (
        <select
            id={id}
            className={className}
            value={value}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        >
            <option value="">選択してください</option>
            {drainAppearanceOptions.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
}

/* ------------------------------------------------------------------ */
/*  ExitSiteStatusCheckboxes — 出口部の状態チェックボックス群               */
/* ------------------------------------------------------------------ */

type ExitSiteStatusCheckboxesProps = {
    /** 選択中の状態リスト */
    value: string[];
    onChange: (value: string[]) => void;
    /**
     * true: 「正常」を選択すると他を解除し、他を選択すると「正常」を解除する。
     * false/未指定: 排他制御なし（自由に複数選択可能）。
     */
    exclusiveNormal?: boolean;
    /** チェックボックスグリッドの追加className */
    className?: string;
};

export function ExitSiteStatusCheckboxes({
    value,
    onChange,
    exclusiveNormal = false,
    className = "grid grid-cols-2 gap-x-4 gap-y-2"
}: ExitSiteStatusCheckboxesProps) {
    return (
        <div className={className}>
            {exitSiteStatusOptions.map((opt) => {
                const checked = value.includes(opt);
                return (
                    <label
                        key={opt}
                        className="flex items-center gap-2 text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        <Checkbox
                            checked={checked}
                            onCheckedChange={(nextChecked) => {
                                const newList = new Set(value);
                                if (nextChecked === true) {
                                    if (exclusiveNormal) {
                                        if (opt === "正常") {
                                            newList.clear();
                                            newList.add("正常");
                                        } else {
                                            newList.delete("正常");
                                            newList.add(opt);
                                        }
                                    } else {
                                        newList.add(opt);
                                    }
                                } else {
                                    newList.delete(opt);
                                }
                                onChange(Array.from(newList));
                            }}
                        />
                        <span>{opt}</span>
                    </label>
                );
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  NumericField — ラベル付き数値入力                                     */
/* ------------------------------------------------------------------ */

type NumericFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    id?: string;
    /** 単位テキスト（例: "g", "ml", "kg"） */
    unit?: string;
    /** "numeric"（整数）または "decimal"（小数） */
    mode?: "numeric" | "decimal";
    min?: number;
    step?: string;
    /** input要素のclassName */
    inputClassName?: string;
    /** 外側コンテナのclassName */
    className?: string;
};

export function NumericField({
    label,
    value,
    onChange,
    id,
    unit,
    mode = "numeric",
    min,
    step,
    inputClassName = "h-8 w-24 rounded-md border bg-background px-3 text-sm",
    className = "grid min-w-0 grid-cols-[1fr_auto] items-center gap-2"
}: NumericFieldProps) {
    return (
        <div className={className}>
            <label className="min-w-0 truncate text-sm font-medium" htmlFor={id}>
                {label}{unit ? `(${unit})` : ""}
            </label>
            <input
                id={id}
                type="number"
                inputMode={mode === "decimal" ? "decimal" : "numeric"}
                min={min}
                step={step}
                className={inputClassName}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(normalizeNumericInput(e.target.value, mode))
                }
            />
        </div>
    );
}
