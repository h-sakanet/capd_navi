import {
  collectDirectChildFiles,
  findSelectedFileByAssetKey,
  normalizeImageList,
  validateCsvImport,
  validateReferencedImages
} from "../../lib/csv-import";

const csvText = [
  "通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,必須チェック数,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit",
  "1,step_001,,準備,お腹-独立,開始,img-1.png,表示,,,,,,,,,,,,,"
].join("\n");

describe("csv-import", () => {
  it("UT-CSV-008: 画像リストを正規化できる", () => {
    const normalized = normalizeImageList("img-1.png, img-2.png\nimg-3.png");
    expect(normalized).toEqual(["img-1.png", "img-2.png", "img-3.png"]);
  });

  it("UT-CSV-011: CSVを解析して参照画像一覧を返す", () => {
    const result = validateCsvImport(csvText);
    expect(result.stepCount).toBe(1);
    expect(result.referencedImages).toEqual(["img-1.png"]);
  });

  it("UT-CSV-013: フォルダ直下ファイルのみ抽出できる", () => {
    const directFile = new File(["a"], "img-1.png", { type: "image/png" });
    Object.defineProperty(directFile, "webkitRelativePath", {
      value: "assets/img-1.png"
    });
    const nestedFile = new File(["b"], "img-2.png", { type: "image/png" });
    Object.defineProperty(nestedFile, "webkitRelativePath", {
      value: "assets/nested/img-2.png"
    });

    const files = collectDirectChildFiles([directFile, nestedFile]);

    expect(Array.from(files.keys())).toEqual(["img-1.png"]);
  });

  it("UT-CSV-014: CSV参照画像に対する不足一覧を返せる", () => {
    const result = validateReferencedImages(["img-1.png", "img-2.png"], ["img-1.png"]);

    expect(result.matched).toEqual(["img-1.png"]);
    expect(result.missing).toEqual(["img-2.png"]);
  });

  it("UT-CSV-015: 一致画像のみ保存対象として抽出できる", () => {
    const result = validateReferencedImages(["img-1.png", "img-2.png", "img-3.png"], ["img-1.png", "img-3.png"]);

    expect(result.matched).toEqual(["img-1.png", "img-3.png"]);
    expect(result.missing).toEqual(["img-2.png"]);
  });

  it("UT-CSV-016: 拡張子の大小文字差があっても参照画像を一致判定できる", () => {
    const result = validateReferencedImages(["img-1.png", "img-2.png"], ["img-1.PNG", "img-2.PnG"]);

    expect(result.matched).toEqual(["img-1.png", "img-2.png"]);
    expect(result.missing).toEqual([]);
  });

  it("UT-CSV-017: assetKey と選択ファイル名の大小文字差を吸収してファイルを引ける", () => {
    const pngFile = new File(["a"], "img-1.PNG", { type: "image/png" });
    const filesByName = new Map<string, File>([["img-1.PNG", pngFile]]);

    const found = findSelectedFileByAssetKey(filesByName, "img-1.png");

    expect(found).toBe(pngFile);
  });
});
