import type { FundKey, TierRule, TransformationMethod } from "../types";

const ONE_MILLION_CENTS = 1_000_000 * 100;

export const DISCLAIMER =
  "本计算器仅用于成果转化收益分配测算，正式分配以最终审核和入账结果为准。";

export const POLICY_VERSION = "山大规字〔2026〕2号";

export const FUND_NAMES: Record<FundKey, string> = {
  team: "奖励成果完成人收益（元），即现金奖励金额",
  unit: "二级单位科研发展基金（元）",
  school: "学校基金（元）",
  special: "科技成果转化专项基金（元）",
};

export const SHANDONG_RATE_ADJUSTMENTS: Record<FundKey, number> = {
  team: 200,
  unit: -100,
  school: -50,
  special: -50,
};

export const METHOD_LABELS: Record<TransformationMethod, string> = {
  transfer: "所有权转让",
  license: "所有权许可",
  equity_cash: "股权+货币资金",
  equity_cash_equity: "股权+货币资金+股权",
  equity_equity: "股权+股权",
};

export const TIER_BOUNDS = [
  { id: "T1", label: "T1：0 - 1,000万元", minCents: 0, maxCents: 10 * ONE_MILLION_CENTS },
  { id: "T2", label: "T2：1,000万 - 5,000万元", minCents: 10 * ONE_MILLION_CENTS, maxCents: 50 * ONE_MILLION_CENTS },
  { id: "T3", label: "T3：5,000万 - 1亿元", minCents: 50 * ONE_MILLION_CENTS, maxCents: 100 * ONE_MILLION_CENTS },
  { id: "T4", label: "T4：1亿 - 5亿元", minCents: 100 * ONE_MILLION_CENTS, maxCents: 500 * ONE_MILLION_CENTS },
  { id: "T5", label: "T5：超过 5亿元", minCents: 500 * ONE_MILLION_CENTS, maxCents: null },
];

const TRANSFER_RATES: Array<Record<FundKey, number>> = [
  { team: 8000, unit: 900, school: 600, special: 500 },
  { team: 8200, unit: 700, school: 600, special: 500 },
  { team: 8500, unit: 600, school: 500, special: 400 },
  { team: 8700, unit: 500, school: 500, special: 300 },
  { team: 9000, unit: 400, school: 400, special: 200 },
];

const LICENSE_RATES: Array<Record<FundKey, number>> = [
  { team: 8500, unit: 600, school: 500, special: 400 },
  { team: 8700, unit: 600, school: 400, special: 300 },
  { team: 9000, unit: 400, school: 400, special: 200 },
  { team: 9200, unit: 300, school: 300, special: 200 },
  { team: 9500, unit: 200, school: 200, special: 100 },
];

export function getTierRules(method: TransformationMethod): TierRule[] {
  const rates = method === "transfer" ? TRANSFER_RATES : LICENSE_RATES;
  return TIER_BOUNDS.map((tier, index) => ({
    ...tier,
    rates: rates[index],
  }));
}

export function rateToPercent(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(0)}%`;
}
