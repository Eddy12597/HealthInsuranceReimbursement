// 模拟药品API服务
module.exports = {
  // 获取药品列表
  getDrugList: () => [
    {name: '阿司匹林', rate: 70, self: 30, desc: '需二级以上医院处方，年度限额2000元'},
    {name: '胰岛素', rate: 80, self: 20, desc: '需糖尿病诊断证明，需提供血糖检测报告'},
    {name: '降压药', rate: 60, self: 40, desc: '需血压检测报告，年度限额1500元'},
    {name: '感冒药', rate: 50, self: 50, desc: 'OTC药品，需提供购药发票'},
    {name: '维生素', rate: 40, self: 60, desc: '营养补充剂，报销比例较低'}
  ],
  // 获取药品详情
  getDrugDetail: (name) => {
    const drugs = this.getDrugList()
    return drugs.find(item => item.name === name)
  }
}
