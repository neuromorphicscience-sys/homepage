import type {
  CalculationResult,
  AllocationDisplayRow,
  CostBreakdown,
  FinalAllocationRow,
  FormState,
  FundKey,
  SliceResult,
  ValidationMessage,
} from "../types";
import { FUND_NAMES, getTierRules } from "./policyRules";
import { allocateByBasisPoints, parseYuanToCents, prorateCents } from "../utils/money";

const ZERO_BY_FUND: Record<FundKey, number> = {
  team: 0,
  unit: 0,
  school: 0,
  special: 0,
};

const COST_FIELDS: Array<keyof FormState["costs"]> = [
  "patent",
  "business",
  "tax",
  "evaluation",
  "other",
];

function cloneZeroFund(): Record<FundKey, number> {
  return { ...ZERO_BY_FUND };
}

function buildCostBreakdown(form: FormState, isFirstReceipt: boolean, currentReceiptCents: number): CostBreakdown {
  const patentCents = parseYuanToCents(form.costs.patent);
  const businessCents = parseYuanToCents(form.costs.business);
  const taxCents = parseYuanToCents(form.costs.tax);
  const evaluationCents = parseYuanToCents(form.costs.evaluation);
  const otherCostCents = parseYuanToCents(form.costs.other);
  const enteredCostCents = patentCents + businessCents + taxCents + evaluationCents + otherCostCents;
  const totalCostCents = isFirstReceipt ? enteredCostCents : 0;

  return {
    patentCents,
    businessCents,
    taxCents,
    evaluationCents,
    otherCostCents,
    totalCostCents,
    distributableNetIncomeCents: currentReceiptCents - totalCostCents,
  };
}

function validate(form: FormState, costBreakdown: CostBreakdown): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  const contractAmountCents = parseYuanToCents(form.contractAmount);
  const currentReceiptCents = parseYuanToCents(form.currentReceipt);
  const previousReceiptCents = parseYuanToCents(form.previousReceipt);
  const isFirstReceipt = previousReceiptCents === 0;

  if (contractAmountCents <= 0) {
    messages.push({ type: "error", message: "合同总金额必须大于 0。" });
  }

  if (currentReceiptCents <= 0 && form.transformationMethod !== "equity_equity") {
    messages.push({ type: "error", message: "本次到账现金必须大于 0。" });
  }

  if (previousReceiptCents < 0) {
    messages.push({ type: "error", message: "本次前累计到账金额不能小于 0。" });
  }

  if (previousReceiptCents + currentReceiptCents > contractAmountCents && contractAmountCents > 0) {
    messages.push({
      type: "warning",
      message: "本次前累计到账金额 + 本次到账现金已超过合同总金额，请复核合同金额、分期到账和登记口径。",
    });
  }

  for (const field of COST_FIELDS) {
    if (parseYuanToCents(form.costs[field]) < 0) {
      messages.push({ type: "error", message: "成本项不能小于 0。" });
      break;
    }
  }

  if (isFirstReceipt && costBreakdown.totalCostCents > currentReceiptCents) {
    messages.push({
      type: "error",
      message: "首次进账成本合计超过本次到账现金，请科研院和财务部确认是否结转至后续到账或调整成本扣除口径。",
    });
  }

  if (form.transformationMethod === "equity_equity") {
    messages.push({
      type: "error",
      message: "该方式不存在本次现金到账，第一版系统不生成现金分配单，仅生成股权权益登记提示。",
    });
  }

  if (form.transformationMethod === "equity_cash_equity" && !form.cashOnlyForMixedEquity) {
    messages.push({
      type: "error",
      message: "该方式涉及团队权益、学校权益、货币资金和股权组合。请打开“仅计算其中货币资金部分”后再进行现金分配测算。",
    });
  }

  return messages;
}

function getMethodNotice(form: FormState): string | null {
  if (form.transformationMethod === "equity_cash") {
    return "本系统仅计算货币资金部分，团队股权权益和学校股权权益仅作登记提示，不纳入本次现金分配。";
  }

  if (form.transformationMethod === "equity_cash_equity") {
    return "该方式涉及团队权益、学校权益、货币资金和股权组合。第一版系统仅作测算提示，请由科研院、财务部、国资办和持股平台按协议及审批意见处理。";
  }

  if (form.transformationMethod === "equity_equity") {
    return "该方式不存在本次现金到账，第一版系统不生成现金分配单，仅生成股权权益登记提示。";
  }

  return null;
}

function calculateSlices(
  form: FormState,
  contractAmountCents: number,
  netIncomeCents: number,
): SliceResult[] {
  const tiers = getTierRules(form.transformationMethod);
  const slices: SliceResult[] = [];

  for (const tier of tiers) {
    const tierMax = tier.maxCents ?? Number.MAX_SAFE_INTEGER;
    const overlapStart = Math.max(0, tier.minCents);
    const overlapEnd = Math.min(contractAmountCents, tierMax);
    const contractSliceAmountCents = Math.max(0, overlapEnd - overlapStart);

    if (contractSliceAmountCents <= 0) continue;

    // Confirmed first-version rule: tier structure is always weighted by total contract amount.
    const tierNetIncomeCents = prorateCents(netIncomeCents, contractSliceAmountCents, contractAmountCents);

    const originalAmountsCents = cloneZeroFund();
    for (const key of Object.keys(originalAmountsCents) as FundKey[]) {
      originalAmountsCents[key] = allocateByBasisPoints(tierNetIncomeCents, tier.rates[key]);
    }

    slices.push({
      tierId: tier.id,
      tierLabel: tier.label,
      contractSliceAmountCents,
      contractSliceRatio: contractSliceAmountCents / contractAmountCents,
      tierNetIncomeCents,
      rates: tier.rates,
      originalAmountsCents,
    });
  }

  return slices;
}

function sumOriginalTotals(slices: SliceResult[]): Record<FundKey, number> {
  const totals = cloneZeroFund();
  for (const slice of slices) {
    for (const key of Object.keys(totals) as FundKey[]) {
      totals[key] += slice.originalAmountsCents[key];
    }
  }
  return totals;
}

function calculateShandongAdjustments(netIncomeCents: number, enabled: boolean): Record<FundKey, number> {
  if (!enabled) return cloneZeroFund();
  return {
    team: allocateByBasisPoints(netIncomeCents, 200),
    unit: -allocateByBasisPoints(netIncomeCents, 100),
    school: -allocateByBasisPoints(netIncomeCents, 50),
    special: -allocateByBasisPoints(netIncomeCents, 50),
  };
}

function buildFinalRows(
  originalTotalsCents: Record<FundKey, number>,
  adjustmentsCents: Record<FundKey, number>,
  finalTotalsCents: Record<FundKey, number>,
  tailAdjustmentCents = 0,
): FinalAllocationRow[] {
  const rows: FinalAllocationRow[] = (Object.keys(originalTotalsCents) as FundKey[]).map((key) => ({
    key,
    name: FUND_NAMES[key],
    originalCents: originalTotalsCents[key],
    shandongAdjustmentCents: adjustmentsCents[key],
    tailAdjustmentCents: 0,
    finalCents: finalTotalsCents[key],
  }));

  rows.push({
    key: "total",
    name: "合计",
    originalCents: rows.reduce((sum, row) => sum + row.originalCents, 0),
    shandongAdjustmentCents: rows.reduce((sum, row) => sum + row.shandongAdjustmentCents, 0),
    tailAdjustmentCents,
    finalCents: rows.reduce((sum, row) => sum + row.finalCents, 0),
  });

  return rows;
}

function buildDisplayParts(
  originalTotalsCents: Record<FundKey, number>,
  adjustmentsCents: Record<FundKey, number>,
  finalTotalsCents: Record<FundKey, number>,
  costBreakdown: CostBreakdown,
  tailAdjustmentCents: number,
  isFirstReceipt: boolean,
  includeCompensation = true,
) {
  const rowForFund = (key: FundKey): AllocationDisplayRow => ({
    key,
    name: FUND_NAMES[key],
    originalCents: originalTotalsCents[key],
    shandongAdjustmentCents: adjustmentsCents[key],
    tailAdjustmentCents: 0,
    finalCents: finalTotalsCents[key],
  });

  const schoolRows = [rowForFund("school"), rowForFund("special"), rowForFund("unit")];
  const schoolTotalCents = schoolRows.reduce((sum, row) => sum + row.finalCents, 0);

  const researchFundCompensationCents = isFirstReceipt && includeCompensation ? costBreakdown.businessCents : 0;
  const personalCompensationCents = isFirstReceipt && includeCompensation ? costBreakdown.patentCents : 0;
  const inventorRows: AllocationDisplayRow[] = [
    rowForFund("team"),
    {
      key: "researchFundCompensation",
      name: "成本补偿至成果完成人科研发展基金（元）",
      originalCents: researchFundCompensationCents,
      shandongAdjustmentCents: 0,
      tailAdjustmentCents,
      finalCents: researchFundCompensationCents + tailAdjustmentCents,
    },
    {
      key: "personalCompensation",
      name: "成本补偿至个人（元）",
      originalCents: personalCompensationCents,
      shandongAdjustmentCents: 0,
      tailAdjustmentCents: 0,
      finalCents: personalCompensationCents,
    },
  ];

  return {
    schoolPart: {
      rows: schoolRows,
      totalCents: schoolTotalCents,
    },
    inventorPart: {
      rows: inventorRows,
      rewardCents: finalTotalsCents.team,
      researchFundCompensationCents,
      personalCompensationCents,
      researchFundTailAdjustmentCents: tailAdjustmentCents,
      totalCents: inventorRows.reduce((sum, row) => sum + row.finalCents, 0),
    },
  };
}

export function calculateDistribution(form: FormState): CalculationResult {
  const contractAmountCents = parseYuanToCents(form.contractAmount);
  const currentReceiptCents = parseYuanToCents(form.currentReceipt);
  const previousReceiptCents = parseYuanToCents(form.previousReceipt);
  const isFirstReceipt = previousReceiptCents === 0;
  const costBreakdown = buildCostBreakdown(form, isFirstReceipt, currentReceiptCents);
  const messages = validate(form, costBreakdown);
  const methodNotice = getMethodNotice(form);
  const canCalculate = !messages.some((message) => message.type === "error");

  if (!canCalculate) {
    const zeroTotals = cloneZeroFund();
    const emptyParts = buildDisplayParts(
      zeroTotals,
      cloneZeroFund(),
      cloneZeroFund(),
      costBreakdown,
      0,
      isFirstReceipt,
      false,
    );
    return {
      canCalculate,
      messages,
      isFirstReceipt,
      costBreakdown,
      originalTotalsCents: zeroTotals,
      shandongAdjustmentsCents: cloneZeroFund(),
      finalTotalsCents: cloneZeroFund(),
      tailAdjustmentCents: 0,
      ...emptyParts,
      slices: [],
      finalRows: buildFinalRows(zeroTotals, cloneZeroFund(), cloneZeroFund()),
      methodNotice,
      inputsCents: {
        contractAmountCents,
        currentReceiptCents,
        previousReceiptCents,
      },
    };
  }

  const slices = calculateSlices(form, contractAmountCents, costBreakdown.distributableNetIncomeCents);
  const originalTotalsCents = sumOriginalTotals(slices);
  const shandongAdjustmentsCents = calculateShandongAdjustments(costBreakdown.distributableNetIncomeCents, form.inShandong);
  const finalTotalsCents = cloneZeroFund();

  for (const key of Object.keys(finalTotalsCents) as FundKey[]) {
    finalTotalsCents[key] = originalTotalsCents[key] + shandongAdjustmentsCents[key];
  }

  // Rounding can introduce a few cents of drift across slices and adjustments.
  // The second-version rule places that tail difference in the inventor research development fund.
  const finalTotalBeforeTail = Object.values(finalTotalsCents).reduce((sum, value) => sum + value, 0);
  const tailAdjustmentCents = costBreakdown.distributableNetIncomeCents - finalTotalBeforeTail;
  const displayParts = buildDisplayParts(
    originalTotalsCents,
    shandongAdjustmentsCents,
    finalTotalsCents,
    costBreakdown,
    tailAdjustmentCents,
    isFirstReceipt,
  );

  return {
    canCalculate,
    messages,
    isFirstReceipt,
    costBreakdown,
    originalTotalsCents,
    shandongAdjustmentsCents,
    finalTotalsCents,
    tailAdjustmentCents,
    ...displayParts,
    slices,
    finalRows: buildFinalRows(originalTotalsCents, shandongAdjustmentsCents, finalTotalsCents, tailAdjustmentCents),
    methodNotice,
    inputsCents: {
      contractAmountCents,
      currentReceiptCents,
      previousReceiptCents,
    },
  };
}
