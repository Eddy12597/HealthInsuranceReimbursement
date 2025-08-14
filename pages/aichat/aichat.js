const api = require('../../config.js').DEEPSEEK_API_KEY;

// Remove the hardcoded medicine database since we'll get it from the server
// const medicineDatabase = { ... } - REMOVED

// Updated prompt that will be enhanced by server with CSV data
const basePrompt = `你是一个专业的医疗助手，专门帮助用户了解药品信息和医保报销政策。

请用简洁、直接的方式回答用户的问题，保持回答专业但简明扼要。回答尽量控制在3句话以内，除非用户明确要求详细解释。`;

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollTop: 0,
    autoFocus: true,
    loading: false,
    currentRequest: null // Track current request for cancellation
  },

  onLoad() { 
    // Check login status
    this.checkLoginStatus();
    
    // Initialize with a welcome message
    this.addMessage({
      role: 'assistant',
      content: '您好！请问能如何帮到您？',
      id: Date.now()
    });
  },

  onShow() {
    // Check login status when page shows
    this.checkLoginStatus();
  },

  onUnload() {
    // Cancel any ongoing request when page is unloaded
    if (this.data.currentRequest) {
      this.data.currentRequest.abort();
    }
  },

  // Check login status
  checkLoginStatus() {
    const app = getApp();
    
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '使用AI问答功能需要先登录微信账号',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    const message = this.data.inputValue.trim();
    if (!message || this.data.loading) return;

    // Cancel any existing request
    if (this.data.currentRequest) {
      this.data.currentRequest.abort();
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      id: Date.now()
    };
    this.addMessage(userMessage);

    // Clear input immediately for better UX
    this.setData({
      inputValue: '',
      loading: true
    });

    // Call AI API for response
    this.generateAIResponse(message);
  },

  addMessage(message) {
    this.setData({
      messages: [...this.data.messages, message]
    }, () => {
      // Use nextTick to ensure DOM is updated before scrolling
      this.scrollToBottom();
    });
  },

  scrollToBottom() {
    // Use a large value to ensure scroll to bottom
    this.setData({
      scrollTop: 999999
    });
  },

  generateAIResponse(userMessage) {
    console.log('Starting AI response generation for:', userMessage);
    
    const typingMessage = {
      role: 'assistant',
      content: '',
      typing: true,
      id: Date.now() + 1
    };
    this.addMessage(typingMessage);
    let typingMsgId = typingMessage.id;
    
    // No need to send conversation history since server handles context
    
    console.log('Making request to server with message:', userMessage);
    
    console.log('API Key (first 10 chars):', api ? api.substring(0, 10) + '...' : 'undefined');
    
    console.log('About to make wx.request to server...');
    
    // Call our server endpoint which includes CSV data and calls DeepSeek
    const requestTask = wx.request({
      url: 'http://localhost:4000/deepseek/query',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        message: userMessage,
        apiKey: api
      },
      timeout: 15000,
      success: (res) => {
        console.log("Server API Request SUCCESS: ", res);
        
        // Remove typing indicator immediately
        const messages = this.data.messages.filter(msg => msg.id !== typingMsgId);
        this.setData({ messages });

        let aiContent = '服务器繁忙，请稍后再试';
        
        if (res.data && res.data.success && res.data.response) {
            aiContent = res.data.response;
        }

        const aiResponse = {
            role: 'assistant',
            content: aiContent,
            id: Date.now()
        };
        
        // Update UI immediately with response
        this.setData({
            messages: [...messages, aiResponse],
            loading: false,
            currentRequest: null
        }, () => {
            // Scroll to bottom after response is added
            this.scrollToBottom();
        });
      },
      fail: (err) => {
        console.log("API Request FAILED: ", err);
        const messages = this.data.messages.filter(msg => msg.id !== typingMsgId);
        const aiResponse = {
          role: 'assistant',
          content: '服务器繁忙，请稍后再试',
          id: Date.now()
        };
        this.setData({ 
            messages: [...messages, aiResponse], 
            loading: false,
            currentRequest: null
        }, () => {
            // Scroll to bottom after error response is added
            this.scrollToBottom();
        });
        console.error(err);
      }
    });
    
    console.log('wx.request called, requestTask:', requestTask);
    
    // Store request for potential cancellation
    this.setData({ currentRequest: requestTask });
  }
});