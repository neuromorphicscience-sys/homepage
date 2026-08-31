import type { AllocationDisplayRow, CalculationResult } from "../types";
import { rateToPercent } from "../rules/policyRules";
import { formatMoney, formatPercent } from "../utils/money";

interface ResultTablesProps {
  result: CalculationResult;
}

function AllocationTable({ rows }: { rows: AllocationDisplayRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>分成项目</th>
            <th>原始分配金额（元）</th>
            <th>山东省内奖励调整金额（元）</th>
            <th>最终金额（元）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.name}</td>
              <td>{formatMoney(row.originalCents)}</td>
              <td>{formatMoney(row.shandongAdjustmentCents)}</td>
              <td>{formatMoney(row.finalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultTables({ result }: ResultTablesProps) {
  const adjustedRateLabel = result.shandongAdjustmentsCents.team > 0 ? "（省内调整后）" : "";

  return (
    <section className="tables-stack print-block" aria-label="合计与明细查看">
      <details className="panel collapsible-panel allocation-section allocation-section--school">
        <summary className="collapsible-summary">
          <span>合计与明细查看</span>
          <h3>学校部分</h3>
        </summary>
        <div className="collapsible-content">
          <AllocationTable rows={result.schoolPart.rows} />
          <div className="part-total">
            <span>学校部分合计（元）</span>
            <strong>{formatMoney(result.schoolPart.totalCents)}</strong>
          </div>
        </div>
      </details>

      <details className="panel collapsible-panel allocation-section allocation-section--inventor">
        <summary className="collapsible-summary">
          <span>合计与明细查看</span>
          <h3>成果完成人部分</h3>
        </summary>
        <div className="collapsible-content">
          <AllocationTable rows={result.inventorPart.rows} />
          <div className="part-total part-total--primary">
            <span>成果完成人部分合计（元）</span>
            <strong>{formatMoney(result.inventorPart.totalCents)}</strong>
          </div>
        </div>
      </details>

      <details className="panel panel--muted collapsible-panel">
        <summary className="collapsible-summary collapsible-summary--single">
          <h3>阶梯计算明细表</h3>
        </summary>
        <div className="collapsible-content">
          <div className="table-wrap table-wrap--wide">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>阶梯区间</th>
                  <th>合同额阶梯额度（元）</th>
                  <th>合同额阶梯额度占比</th>
                  <th>本区间净收益（元）</th>
                  <th>奖励成果完成人收益比例{adjustedRateLabel}</th>
                  <th>二级单位科研发展基金比例{adjustedRateLabel}</th>
                  <th>学校基金比例{adjustedRateLabel}</th>
                  <th>科技成果转化专项基金比例{adjustedRateLabel}</th>
                  <th>奖励成果完成人收益分配金额（元）</th>
                  <th>二级单位科研发展基金分配金额（元）</th>
                  <th>学校基金分配金额（元）</th>
                  <th>科技成果转化专项基金分配金额（元）</th>
                </tr>
              </thead>
              <tbody>
                {result.slices.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="empty-cell">
                      暂无可展示的阶梯计算明细。
                    </td>
                  </tr>
                ) : (
                  result.slices.map((slice) => (
                    <tr key={slice.tierId}>
                      <td>{slice.tierLabel}</td>
                      <td>{formatMoney(slice.contractSliceAmountCents)}</td>
                      <td>{formatPercent(slice.contractSliceRatio)}</td>
                      <td>{formatMoney(slice.tierNetIncomeCents)}</td>
                      <td>{rateToPercent(slice.effectiveRates.team)}</td>
                      <td>{rateToPercent(slice.effectiveRates.unit)}</td>
                      <td>{rateToPercent(slice.effectiveRates.school)}</td>
                      <td>{rateToPercent(slice.effectiveRates.special)}</td>
                      <td>{formatMoney(slice.finalAmountsCents.team)}</td>
                      <td>{formatMoney(slice.finalAmountsCents.unit)}</td>
                      <td>{formatMoney(slice.finalAmountsCents.school)}</td>
                      <td>{formatMoney(slice.finalAmountsCents.special)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  );
}
