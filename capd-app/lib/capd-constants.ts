/**
 * CAPD記録で共通利用する定数定義
 */

/** 排液の確認 - 選択肢 */
export const drainAppearanceOptions = ["透明", "やや混濁", "混濁", "血性", "その他"] as const;
export type DrainAppearanceOption = (typeof drainAppearanceOptions)[number];

/** 出口部の状態 - 選択肢 */
export const exitSiteStatusOptions = ["正常", "赤み", "痛み", "はれ", "かさぶた", "じゅくじゅく", "出血", "膿"] as const;
export type ExitSiteStatusOption = (typeof exitSiteStatusOptions)[number];
