import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CalculationResult } from "../types";
import { formatMoney } from "../utils/money";

interface ResultSummaryProps {
  result: CalculationResult;
}

export function ResultSummary({ result }: ResultSummaryProps) {
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
        <div className="empty-state">当前存在阻断项，暂不生成现金收入分配测算结果。请调整输入后继续测算。</div>
      )}

      <div className="summary-split">
        <article className="summary-card summary-card--team">
          <span>成果完成人部分合计（元）</span>
          <strong>{formatMoney(result.inventorPart.totalCents)}</strong>
        </article>
        <article className="summary-card summary-card--school">
          <span>学校部分合计（元）</span>
          <strong>{formatMoney(result.schoolPart.totalCents)}</strong>
        </article>
      </div>

      <div className="metric-grid">
        <div>
          <span>本次到账现金（元）</span>
          <strong>{formatMoney(result.inputsCents.currentReceiptCents)}</strong>
        </div>
        <div>
          <span>本次成本合计（元）</span>
          <strong>{formatMoney(result.costBreakdown.totalCostCents)}</strong>
        </div>
        <div>
          <span>本次可分配净收益（元）</span>
          <strong>{formatMoney(result.costBreakdown.distributableNetIncomeCents)}</strong>
        </div>
        <div>
          <span>本次是否首次进账</span>
          <strong>{result.isFirstReceipt ? "是" : "否"}</strong>
        </div>
        <div>
          <span>是否山东省内实施</span>
          <strong>{result.shandongAdjustmentsCents.team > 0 ? "是" : "否"}</strong>
        </div>
      </div>
    </section>
  );
}
