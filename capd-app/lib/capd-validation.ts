/**
 * CAPD記録の共通バリデーション・入力正規化
 *
 * - 値チェック（フォーマット・範囲）のみ。必須チェックは呼び出し側の責任。
 * - セッション画面・Home画面の両方で利用する。
 */

/**
 * 全角数字・記号を半角に変換し、数値入力として正規化する。
 * @param value - 入力文字列
 * @param mode - "numeric"（整数）または "decimal"（小数）
 */
export function normalizeNumericInput(value: string, mode: "numeric" | "decimal"): string {
    const halfWidth = value
        .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
        .replace(/[．。]/g, ".")
        .replace(/，/g, ",")
        .replace(/[＋]/g, "+")
        .replace(/[－ー―‐]/g, "-")
        .replace(/\s+/g, "")
        .replace(/,/g, "");

    if (halfWidth === "") {
        return "";
    }

    const allowed = mode === "decimal" ? halfWidth.replace(/[^0-9.+-]/g, "") : halfWidth.replace(/[^0-9+-]/g, "");
    const sign = allowed.startsWith("-") ? "-" : allowed.startsWith("+") ? "+" : "";
    let normalized = sign + allowed.slice(sign ? 1 : 0).replace(/[+-]/g, "");

    if (mode === "decimal") {
        const firstDotIndex = normalized.indexOf(".");
        if (firstDotIndex >= 0) {
            normalized =
                normalized.slice(0, firstDotIndex + 1) + normalized.slice(firstDotIndex + 1).replace(/\./g, "");
        }
        return normalized;
    }

    return normalized.replace(/\./g, "");
}

/**
 * 文字列を正の数値にパースする。空文字・無効値・0以下は null を返す。
 */
export function parsePositiveNumber(value: string | undefined | null): number | null {
    if (!value) {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

/**
 * 文字列を非負の数値にパースする。空文字・無効値・負の値は null を返す。
 */
export function parseNonNegativeNumber(value: string | undefined | null): number | null {
    if (!value) {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }
    return parsed;
}

/**
 * HH:MM 形式の時間バリデーション。空文字は有効として扱う。
 */
export function validateTime(value: string): boolean {
    if (!value) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
}

/**
 * 数値が入力されている場合に > 0 であることを検証する。
 * null/undefined は有効（未入力＝スキップ）。
 */
export function validatePositiveNumber(value: number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    if (value <= 0) return "0より大きい数値を入力してください。";
    return null;
}

/**
 * 数値が入力されている場合に >= 0 であることを検証する。
 * null/undefined は有効（未入力＝スキップ）。
 */
export function validateNonNegativeNumber(value: number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    if (value < 0) return "0以上の数値を入力してください。";
    return null;
}
