import type { CostInputs } from "../types";
import { formatWan } from "../utils/money";

interface CostFormProps {
  costs: CostInputs;
  isFirstReceipt: boolean;
  onChange: <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => void;
}

const patentCostLabels: Array<[keyof CostInputs, string]> = [
  ["patent", "个人承担专利成本"],
  ["business", "科研经费或发展基金支出"],
];

const costLabels: Array<[keyof CostInputs, string]> = [
  ["tax", "税费"],
  ["evaluation", "评估费"],
  ["managerConsulting", "技术经理人咨询服务费"],
  ["other", "个人承担费用"],
];

export function CostForm({ costs, isFirstReceipt, onChange }: CostFormProps) {
  const renderCostField = ([key, label]: [keyof CostInputs, string]) => {
    const hint = formatWan(costs[key]);
    return (
      <label key={key} className={!isFirstReceipt ? "is-disabled" : ""}>
        {label}（元）
        <input
          type="number"
          min="0"
          step="1"
          value={costs[key]}
          disabled={!isFirstReceipt}
          onChange={(event) => onChange(key, event.target.value)}
        />
        {hint && <span className="field-hint">{hint}</span>}
      </label>
    );
  };

  return (
    <section className={`panel ${!isFirstReceipt ? "panel--muted" : ""}`}>
      <div className="section-heading">
        <span>模块 2</span>
        <h2>成本扣除信息</h2>
      </div>

      <div className="notice notice--info">
        已确认口径：成本在第一次现金到账时集中扣除；后续到账默认不再重复扣除既有成本。
      </div>

      {!isFirstReceipt && (
        <div className="notice notice--info">
          当前为后续进账。根据科研院确认口径，既有成本已在首次进账时集中扣除，本次默认不再扣除成本。
        </div>
      )}

      <fieldset className="cost-fieldset">
        <legend>专利成本补偿</legend>
        <div className="form-grid form-grid--compact">{patentCostLabels.map(renderCostField)}</div>
      </fieldset>

      <div className="form-grid">
        {costLabels.map(renderCostField)}
      </div>
    </section>
  );
}
