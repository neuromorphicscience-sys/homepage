import type { CalculationResult, FormState, FundKey } from "../types";
import { DISCLAIMER, FUND_NAMES, METHOD_LABELS, rateToPercent } from "../rules/policyRules";
import { downloadTextFile, formatMoney, formatPercent, formatPlainMoney } from "./money";

function csvEscape(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function joinCsvRow(values: Array<string | number>): string {
  return values.map(csvEscape).join(",");
}

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

export function exportJson(form: FormState, result: CalculationResult): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    input: form,
    result,
    disclaimer:
      "本系统为山东大学科技成果转化收入分配测算工具，计算结果仅供成果负责人、二级单位、科研院和财务部复核参考，正式分配以学校审核意见和财务入账结果为准。",
  };

  downloadTextFile(
    `sdu-tech-transfer-result-${Date.now()}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}

export function exportCsv(result: CalculationResult): void {
  const lines: string[] = [];

  lines.push("最终分配汇总表");
  lines.push(joinCsvRow(["分配对象", "原始分配金额", "山东省内奖励调整金额", "最终分配金额"]));
  for (const row of result.finalRows) {
    lines.push(
      joinCsvRow([
        row.name,
        formatPlainMoney(row.originalCents),
        formatPlainMoney(row.shandongAdjustmentCents),
        formatPlainMoney(row.finalCents),
      ]),
    );
  }

  lines.push("");
  lines.push("阶梯计算明细表");
  lines.push(
    joinCsvRow([
      "阶梯区间",
      "合同额切片金额",
      "合同额切片占比",
      "本区间净收益",
      "成果完成人团队比例",
      "二级单位比例",
      "学校基金比例",
      "科技成果转化专项基金比例",
      "成果完成人团队原始金额",
      "二级单位原始金额",
      "学校基金原始金额",
      "科技成果转化专项基金原始金额",
    ]),
  );

  for (const slice of result.slices) {
    lines.push(
      joinCsvRow([
        slice.tierLabel,
        formatPlainMoney(slice.contractSliceAmountCents),
        formatPercent(slice.contractSliceRatio),
        formatPlainMoney(slice.tierNetIncomeCents),
        rateToPercent(slice.rates.team),
        rateToPercent(slice.rates.unit),
        rateToPercent(slice.rates.school),
        rateToPercent(slice.rates.special),
        formatPlainMoney(slice.originalAmountsCents.team),
        formatPlainMoney(slice.originalAmountsCents.unit),
        formatPlainMoney(slice.originalAmountsCents.school),
        formatPlainMoney(slice.originalAmountsCents.special),
      ]),
    );
  }

  downloadTextFile(`sdu-tech-transfer-result-${Date.now()}.csv`, `\ufeff${lines.join("\r\n")}`, "text/csv;charset=utf-8");
}

export function exportPrintablePdf(form: FormState, result: CalculationResult): void {
  const printWindow = window.open("", "_blank", "width=1180,height=820");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.opener = null;

  const projectRows = [
    ["成果名称", form.achievementName || "未填写", "合同编号", form.contractNo || "未填写"],
    ["技术合同登记编号", form.registrationNo || "未填写", "成果负责人", form.leader || "未填写"],
    ["所属二级单位", form.department || "未填写", "受让方", form.transferee || "未填写"],
    ["转化方式", METHOD_LABELS[form.transformationMethod], "政策版本", form.policyVersion],
    ["合同总金额", formatMoney(result.inputsCents.contractAmountCents), "本次到账金额", formatMoney(result.inputsCents.currentReceiptCents)],
    ["本次前累计到账金额", formatMoney(result.inputsCents.previousReceiptCents), "是否首次到账", result.isFirstReceipt ? "是" : "否"],
  ];

  const netIncomeRows = [
    ["本次到账金额", formatMoney(result.inputsCents.currentReceiptCents), "专利费用", formatMoney(result.costBreakdown.patentCents)],
    ["业务成本", formatMoney(result.costBreakdown.businessCents), "税款", formatMoney(result.costBreakdown.taxCents)],
    ["评估费", formatMoney(result.costBreakdown.evaluationCents), "技术经理人咨询服务费", formatMoney(result.costBreakdown.managerConsultingCents)],
    ["其他开支", formatMoney(result.costBreakdown.otherCents), "成本合计", formatMoney(result.costBreakdown.totalCostCents)],
    ["本次可分配净收益", formatMoney(result.costBreakdown.distributableNetIncomeCents), "成本扣除口径", result.isFirstReceipt ? "首次进账集中扣除" : "后续进账不重复扣除"],
  ];

  const sliceHeader = [
    "阶梯区间",
    "合同额切片金额",
    "合同额切片占比",
    "本区间净收益",
    "成果完成人团队比例",
    "二级单位比例",
    "学校基金比例",
    "科技成果转化专项基金比例",
    "成果完成人团队原始金额",
    "二级单位原始金额",
    "学校基金原始金额",
    "科技成果转化专项基金原始金额",
  ];

  const sliceRows = result.slices.map((slice) => [
    slice.tierLabel,
    formatMoney(slice.contractSliceAmountCents),
    formatPercent(slice.contractSliceRatio),
    formatMoney(slice.tierNetIncomeCents),
    rateToPercent(slice.rates.team),
    rateToPercent(slice.rates.unit),
    rateToPercent(slice.rates.school),
    rateToPercent(slice.rates.special),
    formatMoney(slice.originalAmountsCents.team),
    formatMoney(slice.originalAmountsCents.unit),
    formatMoney(slice.originalAmountsCents.school),
    formatMoney(slice.originalAmountsCents.special),
  ]);

  const finalHeader = ["分配对象", "原始分配金额", "山东省内奖励调整金额", "最终分配金额"];
  const finalRows = result.finalRows.map((row) => [
    row.name,
    formatMoney(row.originalCents),
    formatMoney(row.shandongAdjustmentCents),
    formatMoney(row.finalCents),
  ]);

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>山东大学科技成果转化收入分配测算结果</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px;
      color: #1f2328;
      font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
      line-height: 1.55;
    }
    h1 { margin: 0 0 8px; color: #7f101d; font-size: 24px; }
    h2 { margin: 24px 0 10px; color: #7f101d; font-size: 17px; }
    .subtitle, .disclaimer, .tail-note { color: #59636e; font-size: 12px; }
    .disclaimer {
      margin-top: 12px;
      padding: 10px 12px;
      border: 1px solid #d7dce2;
      background: #fafbfc;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
      page-break-inside: auto;
    }
    th, td {
      border: 1px solid #c8ced6;
      padding: 6px 7px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }
    th { background: #f0f2f5; font-weight: 700; }
    .kv th { width: 16%; }
    .kv td { width: 34%; }
    .final tr:last-child td { background: #fff4f5; color: #7f101d; font-weight: 700; }
    .toolbar { margin: 16px 0; }
    .toolbar button {
      border: 0;
      border-radius: 6px;
      background: #9b1424;
      color: #fff;
      cursor: pointer;
      padding: 9px 14px;
      font: inherit;
    }
    @page { size: A4 landscape; margin: 12mm; }
    @media print {
      body { padding: 0; }
      .toolbar { display: none; }
      h2 { page-break-after: avoid; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>山东大学科技成果转化收入分配计算器</h1>
  <div class="subtitle">基于山大规字〔2026〕2号管理办法的现金收益分配测算结果</div>
  <div class="disclaimer"><strong>免责声明：</strong>${escapeHtml(DISCLAIMER)}</div>
  <div class="toolbar"><button type="button" onclick="window.print()">打印 / 另存为 PDF</button></div>

  <h2>项目基本信息</h2>
  <table class="kv"><tbody>${tableRows(projectRows)}</tbody></table>

  <h2>净收益计算表</h2>
  <table class="kv"><tbody>${tableRows(netIncomeRows)}</tbody></table>

  <h2>阶梯计算明细表</h2>
  <table>
    <thead>${tableRows([sliceHeader], true)}</thead>
    <tbody>${sliceRows.length ? tableRows(sliceRows) : `<tr><td colspan="12">暂无可展示的阶梯切片明细。</td></tr>`}</tbody>
  </table>

  <h2>最终分配汇总表</h2>
  <table class="final">
    <thead>${tableRows([finalHeader], true)}</thead>
    <tbody>${tableRows(finalRows)}</tbody>
  </table>
  <p class="tail-note">尾差调整金额：${escapeHtml(formatMoney(result.tailAdjustmentCents))}，默认调整到${escapeHtml(FUND_NAMES.special)}。</p>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 400);
}

export function buildCopyText(form: FormState, result: CalculationResult): string {
  const fundOrder: FundKey[] = ["team", "unit", "school", "special"];
  const lines = [
    "山东大学科技成果转化收入分配测算结果",
    `成果名称：${form.achievementName || "未填写"}`,
    `成果负责人：${form.leader || "未填写"}`,
    `所属二级单位：${form.department || "未填写"}`,
    `转化方式：${METHOD_LABELS[form.transformationMethod]}`,
    `本次到账金额：${formatPlainMoney(result.inputsCents.currentReceiptCents)} 元`,
    `本次成本合计：${formatPlainMoney(result.costBreakdown.totalCostCents)} 元`,
    `本次可分配净收益：${formatPlainMoney(result.costBreakdown.distributableNetIncomeCents)} 元`,
    "",
    "最终分配：",
  ];

  for (const key of fundOrder) {
    lines.push(`${FUND_NAMES[key]}：${formatPlainMoney(result.finalTotalsCents[key])} 元`);
  }

  lines.push("");
  lines.push("说明：计算结果仅供复核参考，正式分配以学校审核意见和财务入账结果为准。");
  return lines.join("\n");
}

export async function copyResultText(form: FormState, result: CalculationResult): Promise<void> {
  const text = buildCopyText(form, result);
  await navigator.clipboard.writeText(text);
}
