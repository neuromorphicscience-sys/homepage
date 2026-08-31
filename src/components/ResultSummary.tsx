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
        <h2>测算结果</h2>
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
        <article className="summary-card summary-card--school">
          <div className="summary-card__total">
            <span>学校部分合计（元）</span>
            <strong>{formatMoney(result.schoolPart.totalCents)}</strong>
          </div>
          <div className="summary-detail-list" aria-label="学校部分明细">
            {result.schoolPart.rows.map((row) => (
              <div className="summary-detail-row" key={row.key}>
                <span>{row.name}</span>
                <strong>{formatMoney(row.finalCents)}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="summary-card summary-card--team">
          <div className="summary-card__total">
            <span>成果完成人部分合计（元）</span>
            <strong>{formatMoney(result.inventorPart.totalCents)}</strong>
          </div>
          <div className="summary-detail-list" aria-label="成果完成人部分明细">
            {result.inventorPart.rows.map((row) => (
              <div className="summary-detail-row" key={row.key}>
                <span>{row.name}</span>
                <strong>{formatMoney(row.finalCents)}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <details className="result-details">
        <summary>测算依据与状态</summary>
        <div className="metric-grid">
          <div>
            <span>本次到账现金（元）</span>
            <strong>{formatMoney(result.inputsCents.currentReceiptCents)}</strong>
          </div>
          <div>
            <span>本次成本扣除合计（元）</span>
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
      </details>
    </section>
  );
}
