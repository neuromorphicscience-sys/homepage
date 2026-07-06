const confirmedRules = [
  "第一版定位为面向老师和科研管理人员的网页计算器，不与财务系统打通。",
  "成本扣除采用“首次进账集中扣除”口径。",
  "后续到账默认不再重复扣除既有成本。",
  "阶梯分配结构按照合同总金额计算，不按照本次到账区间或累计到账区间切片。",
  "本次到账金额只决定本次可分配净收益金额。",
  "计算结果仅供测算和复核参考，正式分配以学校审核意见和财务入账结果为准。",
];

export function ConfirmedRules() {
  return (
    <section className="panel">
      <div className="section-heading">
        <span>已确认口径</span>
        <h2>第一版边界</h2>
      </div>
      <ol className="plain-list">
        {confirmedRules.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
