const questions = [
  "金额尾差最终计入哪个账户。",
  "山东省内实施的认定标准，是受让方注册地、项目实施地、产业化落地地，还是合同约定地。",
  "“提成”“一企一策”项目是否允许手动覆盖系统默认比例。",
  "“股权+货币资金+股权”方式中的货币资金部分是否仍按第 21 条阶梯表计算，还是按专项协议处理。",
  "团队内部分配方案是否需要在系统中继续扩展为公示流程。",
  "后续是否需要接入学校统一身份认证、科研管理系统或财务系统。",
];

export function ConfirmQuestions() {
  return (
    <section className="panel">
      <div className="section-heading">
        <span>上线前确认</span>
        <h2>仍需确认的问题</h2>
      </div>
      <ol className="plain-list">
        {questions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
