// 首页逻辑
Page({
  data: {
    // 当前页面不需要特殊数据
  },
  onLoad: function() {
    // 页面加载时的初始化操作
  },
  // 语音输入功能（根据用户要求已移除）
  /*
  startRecord: function() {
    wx.startRecord({
      success: (res) => {
        const tempFilePath = res.tempFilePath
        // 这里原本应该调用语音识别服务
        wx.showToast({
          title: '语音功能已移除',
          icon: 'none'
        })
      },
      fail: (err) => {
        console.error('录音失败', err)
      }
    })
  }
  */
})
