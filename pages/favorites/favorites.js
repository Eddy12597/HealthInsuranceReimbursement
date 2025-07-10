// 收藏页面逻辑
const BACKEND_URL = 'http://localhost:3000'; // 修改为你的后端地址
const MOCK_OPENID = 'test_openid'; // 实际部署时请替换为真实 openid

Page({
  data: {
    favorites: [] // 收藏列表
  },
  // 页面加载时获取收藏数据
  onLoad() {
    this.loadFavorites()
  },
  // 页面显示时刷新收藏数据
  onShow() {
    this.loadFavorites()
  },
  // 加载收藏数据（从后端获取）
  loadFavorites() {
    wx.request({
      url: `${BACKEND_URL}/getFavorites`,
      method: 'GET',
      data: { openid: MOCK_OPENID },
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
              openid: MOCK_OPENID,
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