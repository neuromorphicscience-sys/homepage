import type { CellObject, SheetData } from "write-excel-file/browser";
import type { AllocationDisplayRow, CalculationResult, FormState } from "../types";
import { DISCLAIMER, rateToPercent } from "../rules/policyRules";
import { formatMoney, formatPercent, formatPlainMoney } from "./money";

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tableRows(rows: Array<Array<string | number>>, heading = false): string {
  const cellTag = heading ? "th" : "td";
  return rows
    .map((row) => `<tr>${row.map((cell) => `<${cellTag}>${escapeHtml(cell)}</${cellTag}>`).join("")}</tr>`)
    .join("");
}

function moneyCell(cents: number): CellObject {
  return { value: cents / 100, type: Number, format: "#,##0.00" };
}

function percentCell(value: number): CellObject {
  return { value, type: Number, format: "0.00%" };
}

const EXPORT_TITLE = "山东大学科技成果转化现金收益分配测算结果";

function buildExportBaseName(form: FormState): string {
  const leaderName = form.leader
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "");
  return `${EXPORT_TITLE}-${leaderName || "未填写"}`;
}

function allocationRows(
  title: string,
  rows: AllocationDisplayRow[],
  totalLabel: string,
  totalCents: number,
): SheetData {
  const headerStyle = { fontWeight: "bold" as const, backgroundColor: "#f0f2f5", wrap: true };
  return [
    [{ value: title, columnSpan: 4, fontWeight: "bold", textColor: "#9b1424", fontSize: 13 }, null, null, null],
    [
      { value: "分成项目", ...headerStyle },
      { value: "原始分配金额（元）", ...headerStyle },
      { value: "山东省内奖励调整金额（元）", ...headerStyle },
      { value: "最终金额（元）", ...headerStyle },
    ],
    ...rows.map((row) => [
      row.name,
      moneyCell(row.originalCents),
      moneyCell(row.shandongAdjustmentCents),
      moneyCell(row.finalCents),
    ]),
    [
      { value: totalLabel, fontWeight: "bold", textColor: "#7f101d", backgroundColor: "#fff3f3" },
      { value: "", backgroundColor: "#fff3f3" },
      { value: "", backgroundColor: "#fff3f3" },
      { ...moneyCell(totalCents), fontWeight: "bold", textColor: "#7f101d", backgroundColor: "#fff3f3" },
    ],
    [],
  ];
}

export async function exportExcel(form: FormState, result: CalculationResult): Promise<void> {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const summaryData: SheetData = [
    [{ value: EXPORT_TITLE, columnSpan: 4, fontWeight: "bold", fontSize: 16, textColor: "#7f101d", align: "center" }, null, null, null],
    [{ value: "测算依据概况", columnSpan: 4, fontWeight: "bold", fontSize: 13 }, null, null, null],
    ["本次到账现金（元）", moneyCell(result.inputsCents.currentReceiptCents)],
    ["本次成本扣除合计（元）", moneyCell(result.costBreakdown.totalCostCents)],
    ["本次可分配净收益（元）", moneyCell(result.costBreakdown.distributableNetIncomeCents)],
    ["是否首次进账", result.isFirstReceipt ? "是" : "否"],
    ["是否山东省内实施", result.inShandong ? "是" : "否"],
    [],
    [{ value: "合计与明细查看", columnSpan: 4, fontWeight: "bold", fontSize: 13 }, null, null, null],
    ...allocationRows("学校部分", result.schoolPart.rows, "学校部分合计（元）", result.schoolPart.totalCents),
    ...allocationRows("成果完成人部分", result.inventorPart.rows, "成果完成人部分合计（元）", result.inventorPart.totalCents),
  ];

  const adjustedRateLabel = result.inShandong ? "（省内调整后）" : "";
  const detailHeaders = [
    "阶梯区间",
    "合同额阶梯额度（元）",
    "合同额阶梯额度占比",
    "本区间净收益（元）",
    `奖励成果完成人收益比例${adjustedRateLabel}`,
    `二级单位科研发展基金比例${adjustedRateLabel}`,
    `学校基金比例${adjustedRateLabel}`,
    `科技成果转化专项基金比例${adjustedRateLabel}`,
    "奖励成果完成人收益分配金额（元）",
    "二级单位科研发展基金分配金额（元）",
    "学校基金分配金额（元）",
    "科技成果转化专项基金分配金额（元）",
  ];
  const detailData: SheetData = [
    detailHeaders.map((value) => ({ value, fontWeight: "bold", backgroundColor: "#f0f2f5", align: "center", verticalAlign: "center", wrap: true })),
    ...result.slices.map((slice) => [
      slice.tierLabel,
      moneyCell(slice.contractSliceAmountCents),
      percentCell(slice.contractSliceRatio),
      moneyCell(slice.tierNetIncomeCents),
      percentCell(slice.effectiveRates.team / 10_000),
      percentCell(slice.effectiveRates.unit / 10_000),
      percentCell(slice.effectiveRates.school / 10_000),
      percentCell(slice.effectiveRates.special / 10_000),
      moneyCell(slice.finalAmountsCents.team),
      moneyCell(slice.finalAmountsCents.unit),
      moneyCell(slice.finalAmountsCents.school),
      moneyCell(slice.finalAmountsCents.special),
    ]),
  ];

  await writeExcelFile([
    {
      data: summaryData,
      sheet: "合计与明细",
      columns: [{ width: 46 }, { width: 23 }, { width: 29 }, { width: 23 }],
      stickyRowsCount: 2,
    },
    {
      data: detailData,
      sheet: "阶梯计算明细",
      columns: detailHeaders.map((_, index) => ({ width: index === 0 ? 20 : index < 4 ? 24 : 27 })),
      stickyRowsCount: 1,
    },
  ], { fontFamily: "Microsoft YaHei", fontSize: 11 }).toFile(`${buildExportBaseName(form)}.xlsx`);
}

export function exportPrintablePdf(form: FormState, result: CalculationResult): void {
  const printWindow = window.open("", "_blank", "width=1180,height=820");
  if (!printWindow) {
    const previousTitle = document.title;
    document.title = buildExportBaseName(form);
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1_000);
    return;
  }

  printWindow.opener = null;
  const adjustedRateLabel = result.inShandong ? "（省内调整后）" : "";
  const allocationHeader = ["分成项目", "原始分配金额（元）", "山东省内奖励调整金额（元）", "最终金额（元）"];
  const allocationRows = (rows: AllocationDisplayRow[]) => rows.map((row) => [
    row.name,
    formatMoney(row.originalCents),
    formatMoney(row.shandongAdjustmentCents),
    formatMoney(row.finalCents),
  ]);
  const sliceHeader = [
    "阶梯区间",
    "合同额阶梯额度（元）",
    "合同额阶梯额度占比",
    "本区间净收益（元）",
    `奖励成果完成人收益比例${adjustedRateLabel}`,
    `二级单位科研发展基金比例${adjustedRateLabel}`,
    `学校基金比例${adjustedRateLabel}`,
    `科技成果转化专项基金比例${adjustedRateLabel}`,
    "奖励成果完成人收益分配金额（元）",
    "二级单位科研发展基金分配金额（元）",
    "学校基金分配金额（元）",
    "科技成果转化专项基金分配金额（元）",
  ];
  const sliceRows = result.slices.map((slice) => [
    slice.tierLabel,
    formatMoney(slice.contractSliceAmountCents),
    formatPercent(slice.contractSliceRatio),
    formatMoney(slice.tierNetIncomeCents),
    rateToPercent(slice.effectiveRates.team),
    rateToPercent(slice.effectiveRates.unit),
    rateToPercent(slice.effectiveRates.school),
    rateToPercent(slice.effectiveRates.special),
    formatMoney(slice.finalAmountsCents.team),
    formatMoney(slice.finalAmountsCents.unit),
    formatMoney(slice.finalAmountsCents.school),
    formatMoney(slice.finalAmountsCents.special),
  ]);
  const exportBaseName = buildExportBaseName(form);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(exportBaseName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; color: #1f2328; font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif; line-height: 1.5; }
    h1 { margin: 0 0 8px; color: #7f101d; font-size: 24px; }
    h2 { margin: 24px 0 10px; color: #7f101d; font-size: 17px; }
    h3 { margin: 18px 0 8px; font-size: 15px; }
    .subtitle, .disclaimer { color: #59636e; font-size: 12px; }
    .disclaimer { margin-top: 12px; padding: 10px 12px; border: 1px solid #d7dce2; background: #fafbfc; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; page-break-inside: auto; }
    th, td { border: 1px solid #c8ced6; padding: 6px 7px; text-align: left; vertical-align: top; word-break: break-word; }
    th { background: #f0f2f5; font-weight: 700; }
    .summary { width: 70%; font-size: 11px; }
    .total td { background: #fff4f5; color: #7f101d; font-weight: 700; }
    .toolbar { margin: 16px 0; }
    .toolbar button { border: 0; border-radius: 6px; background: #9b1424; color: #fff; cursor: pointer; padding: 9px 14px; font: inherit; }
    @page { size: A4 landscape; margin: 12mm; }
    @media print { body { padding: 0; } .toolbar { display: none; } h2, h3 { page-break-after: avoid; } tr { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>山东大学科技成果转化现金收益分配计算器</h1>
  <div class="subtitle">政策依据：《山东大学科技成果转化工作管理办法》（山大规字〔2026〕2号）</div>
  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>
  <div class="toolbar"><button type="button" onclick="window.print()">打印 / 另存为 PDF</button></div>

  <h2>测算依据概况</h2>
  <table class="summary"><tbody>${tableRows([
    ["学校部分合计（元）", formatMoney(result.schoolPart.totalCents)],
    ["成果完成人部分合计（元）", formatMoney(result.inventorPart.totalCents)],
    ["本次到账现金（元）", formatMoney(result.inputsCents.currentReceiptCents)],
    ["本次成本扣除合计（元）", formatMoney(result.costBreakdown.totalCostCents)],
    ["本次可分配净收益（元）", formatMoney(result.costBreakdown.distributableNetIncomeCents)],
  ])}</tbody></table>

  <h2>合计与明细查看</h2>
  <h3>现金收入分配 - 学校部分</h3>
  <table><thead>${tableRows([allocationHeader], true)}</thead><tbody>${tableRows(allocationRows(result.schoolPart.rows))}${tableRows([["学校部分合计（元）", "", "", formatMoney(result.schoolPart.totalCents)]])}</tbody></table>
  <h3>现金收入分配 - 成果完成人部分</h3>
  <table><thead>${tableRows([allocationHeader], true)}</thead><tbody>${tableRows(allocationRows(result.inventorPart.rows))}${tableRows([["成果完成人部分合计（元）", "", "", formatMoney(result.inventorPart.totalCents)]])}</tbody></table>
  <h3>具体明细 - 阶梯计算明细表</h3>
  <table><thead>${tableRows([sliceHeader], true)}</thead><tbody>${sliceRows.length ? tableRows(sliceRows) : `<tr><td colspan="12">暂无可展示的阶梯计算明细。</td></tr>`}</tbody></table>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 400);
}

export function buildCopyText(form: FormState, result: CalculationResult): string {
  const lines = [
    "山东大学科技成果转化现金收益分配测算结果",
    `成果名称：${form.achievementName || "未填写"}`,
    `成果负责人：${form.leader || "未填写"}`,
    `所属二级单位：${form.department || "未填写"}`,
    `本次到账现金（元）：${formatPlainMoney(result.inputsCents.currentReceiptCents)}`,
    `本次成本扣除合计（元）：${formatPlainMoney(result.costBreakdown.totalCostCents)}`,
    `本次可分配净收益（元）：${formatPlainMoney(result.costBreakdown.distributableNetIncomeCents)}`,
    "",
    `成果完成人部分合计（元）：${formatPlainMoney(result.inventorPart.totalCents)}`,
    `学校部分合计（元）：${formatPlainMoney(result.schoolPart.totalCents)}`,
    "",
    "学校部分：",
  ];

  result.schoolPart.rows.forEach((row) => lines.push(`${row.name}：${formatPlainMoney(row.finalCents)}`));
  lines.push("", "成果完成人部分：");
  result.inventorPart.rows.forEach((row) => lines.push(`${row.name}：${formatPlainMoney(row.finalCents)}`));
  lines.push("", `说明：${DISCLAIMER}`);
  return lines.join("\n");
}

export async function copyResultText(form: FormState, result: CalculationResult): Promise<void> {
  await navigator.clipboard.writeText(buildCopyText(form, result));
}
