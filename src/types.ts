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
  effectiveRates: Record<FundKey, number>;
  originalAmountsCents: Record<FundKey, number>;
  shandongAdjustmentAmountsCents: Record<FundKey, number>;
  finalAmountsCents: Record<FundKey, number>;
}

export interface FinalAllocationRow {
  key: FundKey | "total";
  name: string;
  originalCents: number;
  shandongAdjustmentCents: number;
  tailAdjustmentCents: number;
  finalCents: number;
}

export interface AllocationDisplayRow {
  key: string;
  name: string;
  originalCents: number;
  shandongAdjustmentCents: number;
  tailAdjustmentCents: number;
  finalCents: number;
}

export interface SchoolPart {
  rows: AllocationDisplayRow[];
  totalCents: number;
}

export interface InventorPart {
  rows: AllocationDisplayRow[];
  rewardCents: number;
  researchFundCompensationCents: number;
  personalCompensationCents: number;
  researchFundTailAdjustmentCents: number;
  totalCents: number;
}

export interface CostBreakdown {
  patentCents: number;
  patentDeductionCents: number;
  businessCents: number;
  taxCents: number;
  evaluationCents: number;
  otherCostCents: number;
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
  inShandong: boolean;
  costBreakdown: CostBreakdown;
  originalTotalsCents: Record<FundKey, number>;
  shandongAdjustmentsCents: Record<FundKey, number>;
  finalTotalsCents: Record<FundKey, number>;
  tailAdjustmentCents: number;
  schoolPart: SchoolPart;
  inventorPart: InventorPart;
  slices: SliceResult[];
  finalRows: FinalAllocationRow[];
  methodNotice: string | null;
  inputsCents: {
    contractAmountCents: number;
    currentReceiptCents: number;
    previousReceiptCents: number;
  };
}
