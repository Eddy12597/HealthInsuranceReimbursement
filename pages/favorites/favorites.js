// 收藏页面逻辑
const BACKEND_URL = 'http://localhost:3000'; // 修改为你的后端地址

Page({
  data: {
    favorites: [] // 收藏列表
  },
  
  // 页面加载时获取收藏数据
  onLoad() {
    this.checkLoginAndLoad();
  },
  
  // 页面显示时刷新收藏数据
  onShow() {
    this.checkLoginAndLoad();
  },

  // 检查登录状态并加载收藏
  checkLoginAndLoad() {
    const app = getApp();
    
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '查看收藏需要先登录微信账号',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    this.loadFavorites();
  },
  
  // 加载收藏数据（从后端获取）
  loadFavorites() {
    const app = getApp();
    
    wx.request({
      url: `${BACKEND_URL}/getFavorites`,
      method: 'GET',
      data: { openid: app.globalData.openid },
      success: (res) => {
        this.setData({
          favorites: res.data.favorites || []
        })
      },
      fail: () => {
        wx.showToast({ title: '获取收藏失败', icon: 'none' })
      }
    })
  },
  
  // 移除收藏
  removeFavorite(e) {
    const index = e.currentTarget.dataset.index
    let favorites = this.data.favorites.slice() // 拷贝数组
    const app = getApp();
    
    // 弹出确认框
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {  
          favorites.splice(index, 1)
          // 更新到后端
          wx.request({
            url: `${BACKEND_URL}/setFavorites`,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: {
              openid: app.globalData.openid,
              favorites: favorites
            },
            success: () => {
              this.setData({ favorites: favorites })
              wx.showToast({ title: '已取消收藏', icon: 'success' })
            },
            fail: () => {
              wx.showToast({ title: '更新失败', icon: 'none' })
            }
          })
        }
      }
    })
  }
})
