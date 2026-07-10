import type { AllocationDisplayRow, CalculationResult, FormState } from "../types";
import { METHOD_LABELS, SIMPLE_DISCLAIMER, rateToPercent } from "../rules/policyRules";
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
    schoolPart: result.schoolPart,
    inventorPart: result.inventorPart,
    tailAdjustmentCents: result.tailAdjustmentCents,
    disclaimer: SIMPLE_DISCLAIMER,
  };

  downloadTextFile(
    `sdu-tech-transfer-result-${Date.now()}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}

export function exportCsv(result: CalculationResult): void {
  const lines: string[] = [];

  const appendAllocationRows = (title: string, rows: AllocationDisplayRow[], totalLabel: string, totalCents: number) => {
    lines.push(title);
    lines.push(joinCsvRow(["分成项目", "原始分配金额", "山东省内奖励调整金额", "尾差调整金额", "最终金额（元）"]));
    for (const row of rows) {
      lines.push(
        joinCsvRow([
          row.name,
          formatPlainMoney(row.originalCents),
          formatPlainMoney(row.shandongAdjustmentCents),
          formatPlainMoney(row.tailAdjustmentCents),
          formatPlainMoney(row.finalCents),
        ]),
      );
    }
    lines.push(
      joinCsvRow([
        totalLabel,
        "",
        "",
        title === "成果完成人部分" ? formatPlainMoney(result.inventorPart.researchFundTailAdjustmentCents) : "0.00",
        formatPlainMoney(totalCents),
      ]),
    );
  };

  appendAllocationRows("学校部分", result.schoolPart.rows, "学校部分合计（元）", result.schoolPart.totalCents);
  lines.push("");
  appendAllocationRows("成果完成人部分", result.inventorPart.rows, "成果完成人部分合计（元）", result.inventorPart.totalCents);
  lines.push("");
  lines.push(joinCsvRow(["成本补偿至成果完成人科研发展基金（元）", formatPlainMoney(result.inventorPart.researchFundCompensationCents)]));
  lines.push(joinCsvRow(["成本补偿至个人（元）", formatPlainMoney(result.inventorPart.personalCompensationCents)]));
  lines.push(joinCsvRow(["尾差调整额", formatPlainMoney(result.tailAdjustmentCents)]));

  lines.push("");
  lines.push("阶梯计算明细表");
  lines.push(
    joinCsvRow([
      "阶梯区间",
      "合同额切片金额",
      "合同额切片占比",
      "本区间净收益",
      "奖励成果完成人收益比例",
      "二级单位科研发展基金比例",
      "学校基金比例",
      "科技成果转化专项基金比例",
      "奖励成果完成人收益原始金额",
      "二级单位科研发展基金原始金额",
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
    ["合同总金额", formatMoney(result.inputsCents.contractAmountCents), "本次到账现金", formatMoney(result.inputsCents.currentReceiptCents)],
    ["本次前累计到账金额", formatMoney(result.inputsCents.previousReceiptCents), "是否首次到账", result.isFirstReceipt ? "是" : "否"],
  ];

  const netIncomeRows = [
    ["本次到账现金（元）", formatMoney(result.inputsCents.currentReceiptCents), "税费（元）", formatMoney(result.costBreakdown.taxCents)],
    ["评估费（元）", formatMoney(result.costBreakdown.evaluationCents), "专利成本补偿", formatMoney(result.costBreakdown.patentCents)],
    ["科研经费或发展基金支出（元）", formatMoney(result.costBreakdown.businessCents), "个人承担费用（元）", formatMoney(result.costBreakdown.otherCents)],
    ["技术经理人咨询服务费（元）", formatMoney(result.costBreakdown.managerConsultingCents), "本次成本合计（元）", formatMoney(result.costBreakdown.totalCostCents)],
    ["本次可分配净收益（元）", formatMoney(result.costBreakdown.distributableNetIncomeCents), "成本扣除口径", result.isFirstReceipt ? "首次进账集中扣除" : "后续进账不重复扣除"],
  ];

  const sliceHeader = [
    "阶梯区间",
    "合同额切片金额",
    "合同额切片占比",
    "本区间净收益",
    "奖励成果完成人收益比例",
    "二级单位科研发展基金比例",
    "学校基金比例",
    "科技成果转化专项基金比例",
    "奖励成果完成人收益原始金额",
    "二级单位科研发展基金原始金额",
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

  const allocationHeader = ["分成项目", "原始分配金额", "山东省内奖励调整金额", "尾差调整金额", "最终金额（元）"];
  const schoolRows = result.schoolPart.rows.map((row) => [
    row.name,
    formatMoney(row.originalCents),
    formatMoney(row.shandongAdjustmentCents),
    formatMoney(row.tailAdjustmentCents),
    formatMoney(row.finalCents),
  ]);
  const inventorRows = result.inventorPart.rows.map((row) => [
    row.name,
    formatMoney(row.originalCents),
    formatMoney(row.shandongAdjustmentCents),
    formatMoney(row.tailAdjustmentCents),
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
  <div class="disclaimer"><strong>免责声明：</strong>${escapeHtml(SIMPLE_DISCLAIMER)}</div>
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

  <h2>学校部分</h2>
  <table class="final">
    <thead>${tableRows([allocationHeader], true)}</thead>
    <tbody>${tableRows(schoolRows)}${tableRows([["学校部分合计（元）", "", "", "", formatMoney(result.schoolPart.totalCents)]])}</tbody>
  </table>

  <h2>成果完成人部分</h2>
  <table class="final">
    <thead>${tableRows([allocationHeader], true)}</thead>
    <tbody>${tableRows(inventorRows)}${tableRows([["成果完成人部分合计（元）", "", "", formatMoney(result.inventorPart.researchFundTailAdjustmentCents), formatMoney(result.inventorPart.totalCents)]])}</tbody>
  </table>
  <p class="tail-note">尾差调整：${escapeHtml(formatMoney(result.tailAdjustmentCents))}，已计入成果完成人科研发展基金。</p>
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
    "山东大学科技成果转化收入分配测算结果",
    `成果名称：${form.achievementName || "未填写"}`,
    `成果负责人：${form.leader || "未填写"}`,
    `所属二级单位：${form.department || "未填写"}`,
    `转化方式：${METHOD_LABELS[form.transformationMethod]}`,
    `本次到账现金（元）：${formatPlainMoney(result.inputsCents.currentReceiptCents)}`,
    `本次成本合计（元）：${formatPlainMoney(result.costBreakdown.totalCostCents)}`,
    `本次可分配净收益（元）：${formatPlainMoney(result.costBreakdown.distributableNetIncomeCents)}`,
    "",
    `成果完成人部分合计（元）：${formatPlainMoney(result.inventorPart.totalCents)}`,
    `学校部分合计（元）：${formatPlainMoney(result.schoolPart.totalCents)}`,
    "",
    "学校部分：",
  ];

  result.schoolPart.rows.forEach((row) => lines.push(`${row.name}：${formatPlainMoney(row.finalCents)} 元`));
  lines.push("", "成果完成人部分：");
  result.inventorPart.rows.forEach((row) => lines.push(`${row.name}：${formatPlainMoney(row.finalCents)} 元`));

  lines.push("");
  lines.push(`尾差调整：${formatPlainMoney(result.tailAdjustmentCents)} 元，已计入成果完成人科研发展基金。`);
  lines.push(`说明：${SIMPLE_DISCLAIMER}`);
  return lines.join("\n");
}

export async function copyResultText(form: FormState, result: CalculationResult): Promise<void> {
  const text = buildCopyText(form, result);
  await navigator.clipboard.writeText(text);
}
