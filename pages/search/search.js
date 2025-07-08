// 查询页面逻辑
const drugApi = require('../../mock/drugApi')
Page({
  data: {
    drugList: [],       // 药品列表（从API获取）
    currentType: '',    // 当前选中药品
    reimburseRate: 0,   // 报销比例
    selfPay: 0,         // 自费部分
    description: ''     // 报销描述
  },
  
  // 页面加载时获取药品列表
  onLoad() {
    this.loadDrugList()
  },
  // 从模拟API获取药品列表
  loadDrugList() {
    // 实际开发中替换为：wx.request调用真实接口
    const drugs = drugApi.getDrugList()
    this.setData({
      drugList: drugs,
      currentType: drugs[0].name // 默认选中第一项
    })
    this.updateDrugDetail(drugs[0].name)
  },

  handleInput(e) {
    const query = e.detail.value;
    this.setData({
      searchText: query,
      showSuggestions: true
    });
    
    if (query.length > 0) {
      // Filter drugs that contain the query text (case insensitive)
      const matched = this.data.drugList.filter(drug => 
        drug.name.toLowerCase().includes(query.toLowerCase())
      );
      this.setData({ matchedDrugs: matched });
    } else {
      this.setData({ matchedDrugs: [] });
    }
  },
  
  selectSuggestion(e) {
    const index = e.currentTarget.dataset.index;
    const selectedDrug = this.data.matchedDrugs[index];
    
    this.setData({
      currentType: selectedDrug.name,
      searchText: selectedDrug.name,
      showSuggestions: false,
      // Set other drug info based on your data structure
      reimburseRate: selectedDrug.rate,
      selfPay: 100 - selectedDrug.rate,
      description: selectedDrug.desc
    });
  },
  // 更新药品详情
  updateDrugDetail(drugName) {
    const detail = drugApi.getDrugDetail(drugName)
    this.setData({
      currentType: detail.name,
      reimburseRate: detail.rate,
      selfPay: detail.self,
      description: detail.desc
    })
  },
  // 选择药品（模拟picker选择）
  selectDrug(e) {
    const index = e.detail.value
    this.updateDrugDetail(this.data.drugList[index].name)
  },
  // 添加到收藏
  addToFavorites() {
    // 获取收藏数据
    let favorites = wx.getStorageSync('favorites') || []
    // 检查是否已经收藏
    const isFavorite = favorites.some(item => item.name === this.data.currentType)
    if (isFavorite) {
      wx.showToast({
        title: '已存在于收藏',
        icon: 'none'
      })
      return
    }
    // 添加到收藏
    favorites.push({
      name: this.data.currentType,
      rate: this.data.reimburseRate,
      self: this.data.selfPay,
      desc: this.data.description
    })
    // 保存收藏数据
    wx.setStorageSync('favorites', favorites)
    wx.showToast({
      title: '已加入收藏',
      icon: 'success'
    })
  }
})
