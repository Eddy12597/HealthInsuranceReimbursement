const api = require('../../config.js').DEEPSEEK_API_KEY;

const engineered_prompt = '你是一个乐于助人的AI助手。请用简洁、直接的方式回答用户的问题，保持回答专业但简明扼要。回答尽量控制在3句话以内，除非用户明确要求详细解释。'

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollTop: 0,
    autoFocus: true,
    loading: false
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
    const typingMessage = {
      role: 'assistant',
      content: '',
      typing: true,
      id: Date.now() + 1
    };
    this.addMessage(typingMessage);
    let aiContent = '';
    let typingMsgId = typingMessage.id;
    const self = this; // Fix context for nested function
    wx.request({
      url: 'https://api.deepseek.com/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api}`,
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: engineered_prompt },
          ...this.data.messages
            .filter(msg => !msg.typing)
            .map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7, // Slightly lower temperature for more focused answers
        max_tokens: 150, // Limit response length
      },
    //   success: (res) => {
    //       console.log("API Response: ", res)
    //     // let fullContent = '';
    //     let fullContent = [];

    //     if (res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message) {
    //       fullContent = res.data.choices[0].message.content;
    //     }
    //     let i = 0;
    //     const updateStream = function() {
    //         if (i < fullContent.length) {
    //           // Get the next chunk and append it to aiContent
    //           aiContent += fullContent[i].choices[0].content;
    //           console.log('Updating AI content:', aiContent);  // Log here to check the update
          
    //           // Update the message in the UI
    //           const messages = self.data.messages.map(msg =>
    //             msg.id === typingMsgId ? { ...msg, content: aiContent } : msg
    //           );
    //           self.setData({ messages });
    //           i++;
          
    //           setTimeout(updateStream, 30);
    //         } else {
    //           // When finished, update the UI with the full content
    //           const messages = self.data.messages.filter(msg => msg.id !== typingMsgId);
    //           console.log("Full Content Type: ", typeof fullContent)
    //           const aiResponse = {
    //             role: 'assistant',
    //             content: fullContent.map(chunk => chunk.choices[0].content).join(''), // Join the chunks together
    //             id: Date.now()
    //           };
    //           self.setData({ messages: [...messages, aiResponse], loading: false });
    //           if (typeof self.saveCurrentConversation === 'function') {
    //             self.saveCurrentConversation();
    //           }
    //         }
    //       };
          
    //     updateStream();
    //   },
    // Assuming that 'self.setData()' and other parts of the code are already handling streaming as per your implementation.

    success: (res) => {
        console.log("Raw API Response: ", res);
        
        // Remove typing indicator
        const messages = this.data.messages.filter(msg => msg.id !== typingMsgId);
        this.setData({ messages });

        let aiContent = '服务器繁忙，请稍后再试';
        
        if (res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message) {
            aiContent = res.data.choices[0].message.content;
        }

        const aiResponse = {
            role: 'assistant',
            content: aiContent,
            id: Date.now()
        };
        
        this.setData({
            messages: [...messages, aiResponse],
            loading: false
        });
    },
    
    
      
      
      
      
      
      
      
    
      
      
      fail: (err) => {
        const messages = self.data.messages.filter(msg => msg.id !== typingMsgId);
        const aiResponse = {
          role: 'assistant',
          content: '服务器繁忙，请稍后再试',
          id: Date.now()
        };
        self.setData({ messages: [...messages, aiResponse], loading: false });
        if (typeof self.saveCurrentConversation === 'function') {
          self.saveCurrentConversation();
        }
        console.error(err);
      }
    });
  }
});