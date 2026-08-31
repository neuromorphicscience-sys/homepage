import { ClipboardCopy, FileSpreadsheet, Printer } from "lucide-react";
import type { CalculationResult, FormState } from "../types";
import { copyResultText, exportExcel, exportPrintablePdf } from "../utils/export";

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

  const printPdf = () => {
    try {
      exportPrintablePdf(result);
      onStatus("已打开打印版页面，请在打印窗口中选择“另存为 PDF”。");
    } catch {
      onStatus("打印版页面打开失败，请检查浏览器弹窗拦截设置。");
    }
  };

  const downloadExcel = async () => {
    try {
      await exportExcel(result);
      onStatus("Excel 文件已开始下载。");
    } catch {
      onStatus("Excel 导出失败，请稍后重试或更换浏览器。");
    }
  };

  return (
    <div className="export-bar no-print" aria-label="导出和复制">
      <button type="button" onClick={printPdf} disabled={disabled} title="打印或导出 PDF">
        <Printer size={18} />
        打印 / 导出 PDF
      </button>
      <button type="button" onClick={downloadExcel} disabled={disabled} title="导出 Excel">
        <FileSpreadsheet size={18} />
        导出 Excel
      </button>
      <button type="button" onClick={copy} disabled={disabled} title="复制结果">
        <ClipboardCopy size={18} />
        复制结果
      </button>
    </div>
  );
}
