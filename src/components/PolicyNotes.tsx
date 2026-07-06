export function PolicyNotes() {
  return (
    <section className="panel">
      <div className="section-heading">
        <span>分配规则</span>
        <h2>测算口径说明</h2>
      </div>
      <div className="note-grid">
        <div>
          <h3>阶梯分配结构</h3>
          <p>
            已确认口径：本系统按合同总金额确定阶梯分配结构，本次到账金额仅用于计算本次可分配净收益，不按到账区间切片。
          </p>
        </div>
        <div>
          <h3>本次净收益</h3>
          <p>
            本次可分配净收益先按合同总金额落入各阶梯的占比分摊，再分别适用转让所有权或许可方式下的阶梯比例。
          </p>
        </div>
        <div>
          <h3>山东省内实施奖励修正</h3>
          <p>
            在原始分配基础上，团队增加净收益 2%，二级单位减少 1%，学校基金减少 0.5%，专项基金减少 0.5%。
          </p>
        </div>
      </div>
    </section>
  );
}
