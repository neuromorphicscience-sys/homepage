import type { CalculationResult, FormState } from "../types";
import { FUND_NAMES, METHOD_LABELS, rateToPercent } from "../rules/policyRules";
import { formatMoney, formatPercent } from "../utils/money";

interface ResultTablesProps {
  form: FormState;
  result: CalculationResult;
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
            <span>登记编号</span>
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
          <span>第二层</span>
          <h2>净收益计算表</h2>
        </div>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                <th>本次到账金额</th>
                <td>{formatMoney(result.inputsCents.currentReceiptCents)}</td>
                <th>专利费用</th>
                <td>{formatMoney(result.costBreakdown.patentCents)}</td>
              </tr>
              <tr>
                <th>业务成本</th>
                <td>{formatMoney(result.costBreakdown.businessCents)}</td>
                <th>税款</th>
                <td>{formatMoney(result.costBreakdown.taxCents)}</td>
              </tr>
              <tr>
                <th>评估费</th>
                <td>{formatMoney(result.costBreakdown.evaluationCents)}</td>
                <th>技术经理人咨询服务费</th>
                <td>{formatMoney(result.costBreakdown.managerConsultingCents)}</td>
              </tr>
              <tr>
                <th>其他开支</th>
                <td>{formatMoney(result.costBreakdown.otherCents)}</td>
                <th>成本合计</th>
                <td>{formatMoney(result.costBreakdown.totalCostCents)}</td>
              </tr>
              <tr className="table-emphasis">
                <th>本次可分配净收益</th>
                <td>{formatMoney(result.costBreakdown.distributableNetIncomeCents)}</td>
                <th>成本扣除口径</th>
                <td>{result.isFirstReceipt ? "首次进账集中扣除" : "后续进账不重复扣除"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>第三层</span>
          <h2>阶梯计算明细表</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>阶梯区间</th>
                <th>合同额切片金额</th>
                <th>合同额切片占比</th>
                <th>本区间净收益</th>
                <th>成果完成人团队比例</th>
                <th>二级单位比例</th>
                <th>学校基金比例</th>
                <th>科技成果转化专项基金比例</th>
                <th>成果完成人团队原始金额</th>
                <th>二级单位原始金额</th>
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

      <section className="panel">
        <div className="section-heading">
          <span>第四层</span>
          <h2>最终分配汇总表</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>分配对象</th>
                <th>原始分配金额</th>
                <th>山东省内奖励调整金额</th>
                <th>最终分配金额</th>
              </tr>
            </thead>
            <tbody>
              {result.finalRows.map((row) => (
                <tr key={row.key} className={row.key === "total" ? "table-emphasis" : ""}>
                  <td>{row.name}</td>
                  <td>{formatMoney(row.originalCents)}</td>
                  <td>{formatMoney(row.shandongAdjustmentCents)}</td>
                  <td>{formatMoney(row.finalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tail-note">
          尾差调整金额：{formatMoney(result.tailAdjustmentCents)}，默认调整到{FUND_NAMES.special}。
        </p>
      </section>
    </div>
  );
}
