/**
 * 数値を符号付き文字列に変換する。
 * - 正の値: "+123"
 * - ゼロ: "0"
 * - 負の値: "-123"
 */
export function formatSigned(value: number): string {
    if (value > 0) {
        return `+${value}`;
    }
    return `${value}`;
}
