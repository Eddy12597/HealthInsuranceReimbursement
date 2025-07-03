// 收藏页面逻辑
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
  // 加载收藏数据
  loadFavorites() {
    const favorites = wx.getStorageSync('favorites') || []
    this.setData({
      favorites: favorites
    })
  },
  // 移除收藏
  removeFavorite(e) {
    const index = e.currentTarget.dataset.index
    let favorites = this.data.favorites
    // 弹出确认框
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，移除收藏
          favorites.splice(index, 1)
          wx.setStorageSync('favorites', favorites)
          this.setData({
            favorites: favorites
          })
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        }
      }
    })
  }
})
