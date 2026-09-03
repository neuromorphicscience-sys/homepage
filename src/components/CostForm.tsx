import type { CostInputs } from "../types";
import { formatWan } from "../utils/money";

interface CostFormProps {
  costs: CostInputs;
  isFirstReceipt: boolean;
  onChange: <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => void;
}

const patentCostLabels: Array<[keyof CostInputs, string]> = [
  ["business", "科研经费及发展基金支出"],
  ["patent", "个人承担专利费用"],
];

const costLabels: Array<[keyof CostInputs, string]> = [
  ["tax", "税费"],
  ["evaluation", "评估费"],
  ["other", "其他成本"],
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
        <strong className="notice__label">说明 1：</strong>
        <span>成本应在首次现金到账时一次性集中扣除；后续到账不再重复扣除已扣除的成本。</span>
      </div>

      <div className="notice notice--info">
        <strong className="notice__label">说明 2：</strong>
        <span>个人承担的专利费用按照实际发生额的两倍计入成本扣除，其中双倍扣除额的 50% 补偿至发明人个人，50% 补偿至发明人科研发展基金；科研经费及发展基金支出补偿至成果完成人科研发展基金；税费、评估费及其他成本仅作成本扣除，不予补偿。完成成本扣除及补偿后，剩余净收益按照规定比例分配。</span>
      </div>

      {!isFirstReceipt && (
        <div className="notice notice--info">
          <strong className="notice__label">说明 3：</strong>
          <span>当前为后续到账。本项目成本已于首次到账时集中扣除，本次到账不再重复扣除。</span>
        </div>
      )}

      <fieldset className="cost-fieldset">
        <legend>科技成果成本补偿</legend>
        <div className="form-grid form-grid--compact">{patentCostLabels.map(renderCostField)}</div>
      </fieldset>

      <div className="form-grid">
        {costLabels.map(renderCostField)}
      </div>
    </section>
  );
}
