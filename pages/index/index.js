// 首页逻辑
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    hasUserInfo: false,
    canIUseGetUserProfile: false
  },

  onLoad: function() {
    // 检查是否支持 getUserProfile
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    const userInfo = app.globalData.userInfo;
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo,
      hasUserInfo: !!userInfo
    });
  },

  // 用户登录
  handleLogin() {
    const that = this;
    
    wx.showLoading({
      title: '登录中...'
    });
    
    // Try to get user profile first, but don't fail if it doesn't work
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userRes) => {
        console.log('getUserProfile success:', userRes);
        const userInfo = userRes.userInfo || that.getDefaultUserInfo();
        that.completeLoginProcess(userInfo);
      },
      fail: (err) => {
        console.error('getUserProfile failed:', err);
        // Use default user info and continue
        const defaultUserInfo = that.getDefaultUserInfo();
        that.completeLoginProcess(defaultUserInfo);
      }
    });
  },

  // 完成登录流程
  completeLoginProcess(userInfo) {
    const that = this;
    
    // Get login code and complete login
    app.login().then((result) => {
      // Complete login with backend
      app.completeLogin(result.code, userInfo).then((loginResult) => {
        wx.hideLoading();
        console.log('Login result:', loginResult);
        console.log('User info to set:', loginResult.userInfo);
        that.setData({
          userInfo: loginResult.userInfo,
          isLoggedIn: true,
          hasUserInfo: true
        });
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      }).catch((err) => {
        wx.hideLoading();
        console.error('Backend login failed:', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      });
    }).catch((err) => {
      wx.hideLoading();
      console.error('wx.login failed:', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    });
  },

  // 获取默认用户信息（当getUserProfile失败时使用）
  getDefaultUserInfo() {
    return {
      nickName: '微信用户',
      avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDYwQzE2IDUwLjA1OSAyNC4wNTkgNDIgMzQgNDJINjZDNTUuOTQxIDQyIDQ4IDUwLjA1OSA0OCA2MFY2NkM0OCA2Ni41NTIgNDcuNTUyIDY3IDQ3IDY3SDMzQzMyLjQ0OCA2NyAzMiA2Ni41NTIgMzIgNjZWNjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
      gender: 0,
      country: '',
      province: '',
      city: '',
      language: 'zh_CN'
    };
  },

  // 头像加载失败处理
  onAvatarError() {
    // 如果头像加载失败，使用默认头像
    const userInfo = this.data.userInfo;
    if (userInfo && userInfo.avatarUrl !== '/images/default-avatar.png') {
      userInfo.avatarUrl = '/images/default-avatar.png';
      this.setData({
        userInfo: userInfo
      });
    }
  },

  // 用户登出
  handleLogout() {
    wx.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            userInfo: null,
            isLoggedIn: false,
            hasUserInfo: false
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 导航到其他页面时检查登录状态
  navigateToPage(e) {
    const url = e.currentTarget.dataset.url;
    
    // 如果未登录，提示用户先登录
    if (!this.data.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '使用完整功能需要先登录微信账号',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.handleLogin();
          }
        }
      });
      return;
    }
    
    // 已登录，正常导航
    wx.navigateTo({
      url: url
    });
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
