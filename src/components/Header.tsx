import { BadgeInfo } from "lucide-react";
import { DISCLAIMER } from "../rules/policyRules";

export function Header() {
  return (
    <header className="hero print-block">
      <div className="hero__content">
        <h1>山东大学科技成果转化现金收益分配计算器</h1>
        <p className="subtitle">政策依据：《山东大学科技成果转化工作管理办法》（山大规字〔2026〕2号）</p>
        <div className="disclaimer">
          <BadgeInfo aria-hidden="true" size={18} />
          <span>{DISCLAIMER}</span>
        </div>
      </div>
    </header>
  );
}
