const api = require('../../config.js').DEEPSEEK_API_KEY;

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollTop: 0,
    autoFocus: true,
    loading: false
  },

  onLoad() {
    // Initialize with a welcome message
    this.addMessage({
      role: 'assistant',
      content: '您好！请问能如何帮到您？',
      id: Date.now()
    });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    const message = this.data.inputValue.trim();
    if (!message || this.data.loading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      id: Date.now()
    };
    this.addMessage(userMessage);

    // Clear input
    this.setData({
      inputValue: '',
      loading: true
    });

    // Call AI API for response
    this.generateAIResponse(message);
  },

  addMessage(message) {
    this.setData({
      messages: [...this.data.messages, message],
      scrollTop: this.data.scrollTop + 10000 // Force scroll to bottom
    });
  },

  generateAIResponse(userMessage) {
    // Add typing indicator
    const typingMessage = {
      role: 'assistant',
      content: '',
      typing: true,
      id: Date.now() + 1
    };
    this.addMessage(typingMessage);

    // Call DeepSeek API
    wx.request({
      url: 'https://api.deepseek.com/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api}`,
      },
      data: {
        model: 'deepseek-chat', // or your specific model name
        messages: [
          ...this.data.messages
            .filter(msg => !msg.typing)
            .map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          { role: 'user', content: userMessage }
        ]
      },
      success: (res) => {
        // Remove typing indicator
        const messages = this.data.messages.filter(msg => msg.id !== typingMessage.id);
        this.setData({ messages });

        let aiContent = '...';
        if (res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message) {
          aiContent = res.data.choices[0].message.content;
        }

        const aiResponse = {
          role: 'assistant',
          content: aiContent,
          id: Date.now()
        };
        this.addMessage(aiResponse);
        this.setData({ loading: false });
      },
      fail: (err) => {
        // Remove typing indicator
        const messages = this.data.messages.filter(msg => msg.id !== typingMessage.id);
        this.setData({ messages });

        const aiResponse = {
          role: 'assistant',
          content: '服务器繁忙，请稍后再试',
          id: Date.now()
        };
        this.addMessage(aiResponse);
        this.setData({ loading: false });
        console.error(err);
      }
    });
  }
});