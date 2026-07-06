export type TransformationMethod =
  | "transfer"
  | "license"
  | "equity_cash"
  | "equity_cash_equity"
  | "equity_equity";

export type FundKey = "team" | "unit" | "school" | "special";

export interface CostInputs {
  patent: string;
  business: string;
  tax: string;
  evaluation: string;
  managerConsulting: string;
  other: string;
}

export interface FormState {
  achievementName: string;
  contractNo: string;
  registrationNo: string;
  leader: string;
  department: string;
  transferee: string;
  contractAmount: string;
  currentReceipt: string;
  previousReceipt: string;
  transformationMethod: TransformationMethod;
  inShandong: boolean;
  installment: boolean;
  policyVersion: string;
  costs: CostInputs;
  cashOnlyForMixedEquity: boolean;
}

export interface TierRule {
  id: string;
  label: string;
  minCents: number;
  maxCents: number | null;
  rates: Record<FundKey, number>;
}

export interface SliceResult {
  tierId: string;
  tierLabel: string;
  contractSliceAmountCents: number;
  contractSliceRatio: number;
  tierNetIncomeCents: number;
  rates: Record<FundKey, number>;
  originalAmountsCents: Record<FundKey, number>;
}

export interface FinalAllocationRow {
  key: FundKey | "total";
  name: string;
  originalCents: number;
  shandongAdjustmentCents: number;
  finalCents: number;
}

export interface CostBreakdown {
  patentCents: number;
  businessCents: number;
  taxCents: number;
  evaluationCents: number;
  managerConsultingCents: number;
  otherCents: number;
  totalCostCents: number;
  distributableNetIncomeCents: number;
}

export interface ValidationMessage {
  type: "error" | "warning" | "info";
  message: string;
}

export interface CalculationResult {
  canCalculate: boolean;
  messages: ValidationMessage[];
  isFirstReceipt: boolean;
  costBreakdown: CostBreakdown;
  originalTotalsCents: Record<FundKey, number>;
  shandongAdjustmentsCents: Record<FundKey, number>;
  finalTotalsCents: Record<FundKey, number>;
  tailAdjustmentCents: number;
  slices: SliceResult[];
  finalRows: FinalAllocationRow[];
  methodNotice: string | null;
  inputsCents: {
    contractAmountCents: number;
    currentReceiptCents: number;
    previousReceiptCents: number;
  };
}
