// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    openid: null
  },

  onLaunch() {
    // Check if user is already logged in
    this.checkLoginStatus();
  },

  // Check login status from storage
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = openid;
      this.globalData.isLoggedIn = true;
    }
  },

  // Login method - only handles wx.login, getUserProfile should be called from page
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve({ code: res.code });
          } else {
            reject(new Error('Login failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // Complete login with user profile
  completeLogin(code, userInfo) {
    return new Promise((resolve, reject) => {
      // Send login request to backend
      wx.request({
        url: 'http://localhost:4000/login',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          code: code,
          userInfo: userInfo
        },
        success: (loginRes) => {
          if (loginRes.data.success) {
            const openid = loginRes.data.openid;
            
            // Save to global data
            this.globalData.userInfo = userInfo;
            this.globalData.openid = openid;
            this.globalData.isLoggedIn = true;
            
            // Save to storage
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('openid', openid);
            
            resolve({ userInfo, openid: openid });
          } else {
            reject(new Error('Backend login failed'));
          }
        },
        fail: (err) => {
          // Fallback to mock openid if backend fails
          const mockOpenid = 'user_' + Date.now();
          
          // Save to global data
          this.globalData.userInfo = userInfo;
          this.globalData.openid = mockOpenid;
          this.globalData.isLoggedIn = true;
          
          // Save to storage
          wx.setStorageSync('userInfo', userInfo);
          wx.setStorageSync('openid', mockOpenid);
          
          resolve({ userInfo, openid: mockOpenid });
        }
      });
    });
  },

  // Logout method
  logout() {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    this.globalData.isLoggedIn = false;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
  }
})
