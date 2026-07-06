import type { CalculationResult, FormState, FundKey } from "../types";
import { FUND_NAMES, METHOD_LABELS, rateToPercent } from "../rules/policyRules";
import { downloadTextFile, formatPercent, formatPlainMoney } from "./money";

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

  downloadTextFile(`sdu-tech-transfer-result-${Date.now()}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
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
