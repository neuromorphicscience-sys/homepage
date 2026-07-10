import type { AllocationDisplayRow, CalculationResult, FormState } from "../types";
import { METHOD_LABELS, rateToPercent } from "../rules/policyRules";
import { formatMoney, formatPercent } from "../utils/money";

interface ResultTablesProps {
  form: FormState;
  result: CalculationResult;
}

function AllocationTable({ rows }: { rows: AllocationDisplayRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>分成项目</th>
            <th>原始分配金额</th>
            <th>山东省内奖励调整金额</th>
            <th>尾差调整金额</th>
            <th>最终金额（元）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.name}</td>
              <td>{formatMoney(row.originalCents)}</td>
              <td>{formatMoney(row.shandongAdjustmentCents)}</td>
              <td>{formatMoney(row.tailAdjustmentCents)}</td>
              <td>{formatMoney(row.finalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultTables({ form, result }: ResultTablesProps) {
  return (
    <div className="tables-stack print-block">
      <section className="panel">
        <div className="section-heading">
          <span>项目快照</span>
          <h2>项目基本信息</h2>
        </div>
        <div className="info-grid">
          <div>
            <span>成果名称</span>
            <strong>{form.achievementName || "未填写"}</strong>
          </div>
          <div>
            <span>合同编号</span>
            <strong>{form.contractNo || "未填写"}</strong>
          </div>
          <div>
            <span>技术合同登记编号</span>
            <strong>{form.registrationNo || "未填写"}</strong>
          </div>
          <div>
            <span>成果负责人</span>
            <strong>{form.leader || "未填写"}</strong>
          </div>
          <div>
            <span>所属二级单位</span>
            <strong>{form.department || "未填写"}</strong>
          </div>
          <div>
            <span>受让方</span>
            <strong>{form.transferee || "未填写"}</strong>
          </div>
          <div>
            <span>转化方式</span>
            <strong>{METHOD_LABELS[form.transformationMethod]}</strong>
          </div>
          <div>
            <span>政策版本</span>
            <strong>{form.policyVersion}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>收入与成本</span>
          <h2>本次可分配净收益</h2>
        </div>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                <th>本次到账现金（元）</th>
                <td>{formatMoney(result.inputsCents.currentReceiptCents)}</td>
                <th>税费（元）</th>
                <td>{formatMoney(result.costBreakdown.taxCents)}</td>
              </tr>
              <tr>
                <th>评估费（元）</th>
                <td>{formatMoney(result.costBreakdown.evaluationCents)}</td>
                <th>个人承担专利成本（元）</th>
                <td>{formatMoney(result.costBreakdown.patentCents)}</td>
              </tr>
              <tr>
                <th>科研经费或发展基金支出（元）</th>
                <td>{formatMoney(result.costBreakdown.businessCents)}</td>
                <th>个人承担费用（元）</th>
                <td>{formatMoney(result.costBreakdown.otherCents)}</td>
              </tr>
              <tr>
                <th>技术经理人咨询服务费（元）</th>
                <td>{formatMoney(result.costBreakdown.managerConsultingCents)}</td>
                <th>本次成本合计（元）</th>
                <td>{formatMoney(result.costBreakdown.totalCostCents)}</td>
              </tr>
              <tr className="table-emphasis">
                <th>本次可分配净收益（元）</th>
                <td>{formatMoney(result.costBreakdown.distributableNetIncomeCents)}</td>
                <th>成本扣除口径</th>
                <td>{result.isFirstReceipt ? "首次进账集中扣除" : "后续进账不重复扣除"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel allocation-section allocation-section--school">
        <div className="section-heading">
          <span>现金收入分配</span>
          <h2>学校部分</h2>
        </div>
        <AllocationTable rows={result.schoolPart.rows} />
        <div className="part-total">
          <span>学校部分合计（元）</span>
          <strong>{formatMoney(result.schoolPart.totalCents)}</strong>
        </div>
      </section>

      <section className="panel allocation-section allocation-section--inventor">
        <div className="section-heading">
          <span>现金收入分配</span>
          <h2>成果完成人部分</h2>
        </div>
        <AllocationTable rows={result.inventorPart.rows} />
        <div className="part-total part-total--primary">
          <span>成果完成人部分合计（元）</span>
          <strong>{formatMoney(result.inventorPart.totalCents)}</strong>
        </div>
        <p className="tail-note">
          尾差调整：{formatMoney(result.tailAdjustmentCents)}，已计入成果完成人科研发展基金。
        </p>
        <p className="tail-note">
          成本补偿说明：个人承担专利成本及个人承担费用补偿至个人；科研经费或发展基金支出补偿至成果完成人科研发展基金；补偿完成后再对本次可分配净收益按比例分配。
        </p>
      </section>

      <section className="panel panel--muted">
        <div className="section-heading">
          <span>复核明细</span>
          <h2>阶梯计算明细表</h2>
        </div>
        <div className="table-wrap table-wrap--wide">
          <table className="detail-table">
            <thead>
              <tr>
                <th>阶梯区间</th>
                <th>合同额切片金额</th>
                <th>合同额切片占比</th>
                <th>本区间净收益</th>
                <th>奖励成果完成人收益比例</th>
                <th>二级单位科研发展基金比例</th>
                <th>学校基金比例</th>
                <th>科技成果转化专项基金比例</th>
                <th>奖励成果完成人收益原始金额</th>
                <th>二级单位科研发展基金原始金额</th>
                <th>学校基金原始金额</th>
                <th>科技成果转化专项基金原始金额</th>
              </tr>
            </thead>
            <tbody>
              {result.slices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="empty-cell">
                    暂无可展示的阶梯切片明细。
                  </td>
                </tr>
              ) : (
                result.slices.map((slice) => (
                  <tr key={slice.tierId}>
                    <td>{slice.tierLabel}</td>
                    <td>{formatMoney(slice.contractSliceAmountCents)}</td>
                    <td>{formatPercent(slice.contractSliceRatio)}</td>
                    <td>{formatMoney(slice.tierNetIncomeCents)}</td>
                    <td>{rateToPercent(slice.rates.team)}</td>
                    <td>{rateToPercent(slice.rates.unit)}</td>
                    <td>{rateToPercent(slice.rates.school)}</td>
                    <td>{rateToPercent(slice.rates.special)}</td>
                    <td>{formatMoney(slice.originalAmountsCents.team)}</td>
                    <td>{formatMoney(slice.originalAmountsCents.unit)}</td>
                    <td>{formatMoney(slice.originalAmountsCents.school)}</td>
                    <td>{formatMoney(slice.originalAmountsCents.special)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
