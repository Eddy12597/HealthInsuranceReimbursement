// 查询页面逻辑
const { pinyin } = require('pinyin-pro');

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
  // 从真实API获取药品列表
  /**
   * Loads the drug list from the API and updates the component state.
   * Makes a GET request to retrieve drug data, then updates drugList and currentType in component data.
   * On success, also triggers update of drug details for the first item in the list.
   * Shows error toast if the request fails.
   */
  loadDrugList() {
    const that = this;
    console.log("Loading Drug List")
    wx.request({
      url: 'http://localhost:4000/drugs',
      method: 'GET',
      success(res) {
        const drugs = res.data && res.data.data ? res.data.data : [];
        if (drugs.length > 0) {
          // 为每个药品添加拼音首字母
          const drugsWithPinyin = drugs.map(drug => {
            return {
              ...drug,
              pinyin: pinyin(drug.name, { pattern: 'firstLetter', type: 'array' }).join('')
            };
          });
          
          that.setData({
            drugList: drugsWithPinyin,
            currentType: drugsWithPinyin[0].name
          });
          that.updateDrugDetail(drugsWithPinyin[0].name);
        }
      },
      fail() {
        wx.showToast({ title: '药品数据获取失败，请稍后再试', icon: 'none' });
      }
    });
  },

  handleInput(e) {
    const query = e.detail.value.toLowerCase();
    this.setData({
      searchText: query,
      showSuggestions: true
    });
    
    if (query.length > 0) {
      // 同时匹配药品名称和拼音首字母
      const matched = this.data.drugList.filter(drug => 
        drug.name.toLowerCase().includes(query) || 
        drug.pinyin.toLowerCase().includes(query)
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
  // 更新药品详情（从API获取）
  updateDrugDetail(drugName) {
    const that = this;
    wx.request({
      // url: 'https://api.example.com/drug/detail?name=${encodeURIComponent(drugName)}',
      url: `http://localhost:4000/drug/detail?name=${encodeURIComponent(drugName)}`,
      method: 'GET',
      success(res) {
        // 假设API返回格式为 { name: '药品名', rate: 80, self: 20, desc: '报销说明' }
        const detail = res.data;
        that.setData({
          currentType: detail.name,
          reimburseRate: detail.rate,
          selfPay: detail.self || (100 - detail.rate),
          description: detail.desc
        });
      },
      fail() {
        wx.showToast({ title: '药品详情获取失败', icon: 'none' });
      }
    });
  },
  // 选择药品（模拟picker选择）
  selectDrug(e) {
    const index = e.detail.value
    this.updateDrugDetail(this.data.drugList[index].name)
  },
  // 添加到收藏（通过接口）
  addToFavorites() {
    const that = this;
    const app = getApp();
    
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 先获取当前收藏列表
    wx.request({
      url: 'http://localhost:3000/getFavorites',
      method: 'GET',
      data: { openid: app.globalData.openid },
      success(res) {
        let favorites = res.data.favorites || [];
        // 检查是否已经收藏
        const isFavorite = favorites.some(item => item.name === that.data.currentType);
        if (isFavorite) {
          wx.showToast({
            title: '已存在于收藏',
            icon: 'none'
          });
          return;
        }
        // 添加到收藏
        favorites.push({
          name: that.data.currentType,
          rate: that.data.reimburseRate,
          self: that.data.selfPay,
          desc: that.data.description
        });
        // 保存到后端
        wx.request({
          url: 'http://localhost:3000/setFavorites',
          method: 'POST',
          header: { 'content-type': 'application/json' },
          data: {
            openid: app.globalData.openid,
            favorites: favorites
          },
          success: () => {
            wx.showToast({
              title: '已加入收藏',
              icon: 'success'
            });
          },
          fail: () => {
            wx.showToast({ title: '收藏失败', icon: 'none' });
          }
        });
      },
      fail() {
        wx.showToast({ title: '获取收藏失败', icon: 'none' });
      }
    });
  }
})
