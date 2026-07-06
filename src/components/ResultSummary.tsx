import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CalculationResult } from "../types";
import { FUND_NAMES } from "../rules/policyRules";
import { formatMoney } from "../utils/money";

interface ResultSummaryProps {
  result: CalculationResult;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  const cards = [
    ["team", FUND_NAMES.team, result.finalTotalsCents.team],
    ["unit", FUND_NAMES.unit, result.finalTotalsCents.unit],
    ["school", FUND_NAMES.school, result.finalTotalsCents.school],
    ["special", FUND_NAMES.special, result.finalTotalsCents.special],
  ] as const;

  return (
    <section className="panel result-panel print-block" id="result">
      <div className="section-heading">
        <span>测算结果</span>
        <h2>结果摘要</h2>
      </div>

      {result.methodNotice && <div className="notice notice--info">{result.methodNotice}</div>}

      {result.messages.length > 0 && (
        <div className="message-list">
          {result.messages.map((message) => (
            <div key={message.message} className={`notice notice--${message.type}`}>
              {message.type === "warning" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{message.message}</span>
            </div>
          ))}
        </div>
      )}

      {!result.canCalculate && (
        <div className="empty-state">当前存在阻断项，暂不生成现金分配结果。请调整输入后继续测算。</div>
      )}

      <div className="summary-grid">
        {cards.map(([key, label, value]) => (
          <article className={`summary-card summary-card--${key}`} key={key}>
            <span>{label}</span>
            <strong>{formatMoney(value)}</strong>
          </article>
        ))}
      </div>

      <div className="metric-grid">
        <div>
          <span>本次到账金额</span>
          <strong>{formatMoney(result.inputsCents.currentReceiptCents)}</strong>
        </div>
        <div>
          <span>本次成本合计</span>
          <strong>{formatMoney(result.costBreakdown.totalCostCents)}</strong>
        </div>
        <div>
          <span>本次可分配净收益</span>
          <strong>{formatMoney(result.costBreakdown.distributableNetIncomeCents)}</strong>
        </div>
        <div>
          <span>山东省内奖励修正</span>
          <strong>{result.shandongAdjustmentsCents.team > 0 ? "是" : "否"}</strong>
        </div>
        <div>
          <span>本次是否首次进账</span>
          <strong>{result.isFirstReceipt ? "是" : "否"}</strong>
        </div>
      </div>
    </section>
  );
}
