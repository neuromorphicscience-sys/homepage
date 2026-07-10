import { Calculator, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { CostForm } from "./components/CostForm";
import { ExportButtons } from "./components/ExportButtons";
import { Header } from "./components/Header";
import { ProjectForm } from "./components/ProjectForm";
import { ResultSummary } from "./components/ResultSummary";
import { ResultTables } from "./components/ResultTables";
import { calculateDistribution } from "./rules/calculator";
import { POLICY_VERSION } from "./rules/policyRules";
import type { CostInputs, FormState } from "./types";

const emptyCosts: CostInputs = {
  patent: "0",
  business: "0",
  tax: "0",
  evaluation: "0",
  managerConsulting: "0",
  other: "0",
};

const defaultForm: FormState = {
  achievementName: "",
  contractNo: "",
  registrationNo: "",
  leader: "",
  department: "",
  transferee: "",
  contractAmount: "",
  currentReceipt: "",
  previousReceipt: "0",
  transformationMethod: "license",
  inShandong: true,
  installment: false,
  policyVersion: POLICY_VERSION,
  costs: emptyCosts,
  cashOnlyForMixedEquity: false,
};

const firstReceiptExample: FormState = {
  ...defaultForm,
  achievementName: "高性能智能感知关键技术",
  contractNo: "SDU-2026-CGZH-001",
  registrationNo: "鲁技合登字2026-001",
  leader: "张老师",
  department: "信息科学与工程学院",
  transferee: "山东示范科技有限公司",
  contractAmount: "15000000",
  currentReceipt: "15000000",
  previousReceipt: "0",
  transformationMethod: "license",
  inShandong: true,
  installment: false,
  costs: {
    patent: "200000",
    business: "300000",
    tax: "300000",
    evaluation: "100000",
    managerConsulting: "100000",
    other: "0",
  },
};

const followUpExample: FormState = {
  ...defaultForm,
  achievementName: "高性能智能感知关键技术",
  contractNo: "SDU-2026-CGZH-001",
  registrationNo: "鲁技合登字2026-001",
  leader: "张老师",
  department: "信息科学与工程学院",
  transferee: "山东示范科技有限公司",
  contractAmount: "15000000",
  currentReceipt: "3000000",
  previousReceipt: "5000000",
  transformationMethod: "license",
  inShandong: true,
  installment: true,
  costs: {
    patent: "200000",
    business: "300000",
    tax: "300000",
    evaluation: "100000",
    managerConsulting: "100000",
    other: "0",
  },
};

function App() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState("");
  const result = useMemo(() => calculateDistribution(form), [form]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCost = <K extends keyof CostInputs>(key: K, value: CostInputs[K]) => {
    setForm((current) => ({
      ...current,
      costs: {
        ...current.costs,
        [key]: value,
      },
    }));
  };

  const loadExample = (example: FormState) => {
    setForm(example);
    setStatus("示例数据已载入，结果已自动刷新。");
    requestAnimationFrame(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleCalculate = () => {
    setStatus(result.canCalculate ? "测算结果已刷新。" : "请先处理页面提示的阻断项。");
    document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="page-main">
        <div className="action-row no-print">
          <div>
            <strong>演示数据</strong>
            <span>可直接载入样例，也可以从空白表单开始录入。</span>
          </div>
          <div className="button-group">
            <button type="button" className="secondary-button" onClick={() => loadExample(firstReceiptExample)}>
              载入首次进账示例
            </button>
            <button type="button" className="secondary-button" onClick={() => loadExample(followUpExample)}>
              载入后续进账示例
            </button>
            <button type="button" className="icon-button" onClick={() => loadExample(defaultForm)} title="重置表单">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="workspace-grid">
          <div className="input-stack no-print">
            <ProjectForm form={form} onChange={updateForm} />
            <CostForm costs={form.costs} isFirstReceipt={result.isFirstReceipt} onChange={updateCost} />
            <button type="button" className="primary-button" onClick={handleCalculate}>
              <Calculator size={20} />
              计算分配结果
            </button>
          </div>

          <aside className="result-stack">
            <ResultSummary result={result} />
            <ExportButtons form={form} result={result} onStatus={setStatus} />
            {status && <div className="status-line no-print">{status}</div>}
          </aside>
        </div>

        <ResultTables form={form} result={result} />

      </main>

      <footer className="site-footer print-block">
        <strong>免责声明</strong>
        <span>本计算器仅用于成果转化收入分配测算，正式分配结果以学校审核意见和财务入账结果为准。</span>
      </footer>
    </div>
  );
}

export default App;
