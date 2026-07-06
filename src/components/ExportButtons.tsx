import { ClipboardCopy, Download, FileJson, Printer } from "lucide-react";
import type { CalculationResult, FormState } from "../types";
import { copyResultText, exportCsv, exportJson } from "../utils/export";

interface ExportButtonsProps {
  form: FormState;
  result: CalculationResult;
  onStatus: (message: string) => void;
}

export function ExportButtons({ form, result, onStatus }: ExportButtonsProps) {
  const disabled = !result.canCalculate;

  const copy = async () => {
    try {
      await copyResultText(form, result);
      onStatus("已复制最终分配结果文本。");
    } catch {
      onStatus("复制失败，请检查浏览器剪贴板权限。");
    }
  };

  return (
    <div className="export-bar no-print" aria-label="导出和复制">
      <button type="button" onClick={() => window.print()} disabled={disabled} title="打印或导出 PDF">
        <Printer size={18} />
        打印 / 导出 PDF
      </button>
      <button type="button" onClick={() => exportJson(form, result)} disabled={disabled} title="导出 JSON">
        <FileJson size={18} />
        导出 JSON
      </button>
      <button type="button" onClick={() => exportCsv(result)} disabled={disabled} title="导出 CSV">
        <Download size={18} />
        导出 CSV
      </button>
      <button type="button" onClick={copy} disabled={disabled} title="复制结果">
        <ClipboardCopy size={18} />
        复制结果
      </button>
    </div>
  );
}
