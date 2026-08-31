import type { FormState, TransformationMethod } from "../types";
import { METHOD_LABELS } from "../rules/policyRules";
import { formatWan } from "../utils/money";

interface ProjectFormProps {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

const methodOptions: TransformationMethod[] = [
  "transfer",
  "license",
  "equity_cash",
  "equity_cash_equity",
  "equity_equity",
];

function FieldHint({ value }: { value: string }) {
  const hint = formatWan(value);
  return hint ? <span className="field-hint">{hint}</span> : null;
}

export function ProjectForm({ form, onChange }: ProjectFormProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>项目基本信息</h2>
      </div>

      <div className="form-grid">
        <label>
          成果名称
          <input value={form.achievementName} onChange={(event) => onChange("achievementName", event.target.value)} />
        </label>
        <label>
          审批表编号
          <input value={form.contractNo} onChange={(event) => onChange("contractNo", event.target.value)} />
        </label>
        <label>
          技术合同登记号（选填）
          <input value={form.registrationNo} onChange={(event) => onChange("registrationNo", event.target.value)} />
        </label>
        <label>
          成果负责人
          <input value={form.leader} onChange={(event) => onChange("leader", event.target.value)} />
        </label>
        <label>
          所属二级单位
          <input value={form.department} onChange={(event) => onChange("department", event.target.value)} />
        </label>
        <label>
          受让方
          <input value={form.transferee} onChange={(event) => onChange("transferee", event.target.value)} />
        </label>
        <label>
          合同总金额（元）
          <input
            type="number"
            min="0"
            step="1"
            value={form.contractAmount}
            onChange={(event) => onChange("contractAmount", event.target.value)}
          />
          <FieldHint value={form.contractAmount} />
        </label>
        <label>
          本次到账现金（元）
          <input
            type="number"
            min="0"
            step="1"
            value={form.currentReceipt}
            onChange={(event) => onChange("currentReceipt", event.target.value)}
          />
          <FieldHint value={form.currentReceipt} />
        </label>
        <label>
          本次前累计到账金额（元）
          <input
            type="number"
            min="0"
            step="1"
            value={form.previousReceipt}
            onChange={(event) => onChange("previousReceipt", event.target.value)}
          />
          <FieldHint value={form.previousReceipt} />
        </label>
        <label>
          转化方式
          <select
            value={form.transformationMethod}
            onChange={(event) => onChange("transformationMethod", event.target.value as TransformationMethod)}
          >
            {methodOptions.map((method) => (
              <option key={method} value={method}>
                {METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row-hint">
          该字段仅用于判断是否为首次到账，从而决定本次是否扣除成本；不参与阶梯比例切片。
        </div>
        <label>
          是否山东省内实施
          <select
            value={form.inShandong ? "yes" : "no"}
            onChange={(event) => onChange("inShandong", event.target.value === "yes")}
          >
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        </label>
        <label>
          是否分期到账
          <select
            value={form.installment ? "yes" : "no"}
            onChange={(event) => onChange("installment", event.target.value === "yes")}
          >
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        </label>
        <label>
          政策版本
          <input value={form.policyVersion} onChange={(event) => onChange("policyVersion", event.target.value)} />
        </label>
      </div>

      {form.transformationMethod === "equity_cash_equity" && (
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.cashOnlyForMixedEquity}
            onChange={(event) => onChange("cashOnlyForMixedEquity", event.target.checked)}
          />
          <span>仅计算其中货币资金部分</span>
        </label>
      )}
    </section>
  );
}
