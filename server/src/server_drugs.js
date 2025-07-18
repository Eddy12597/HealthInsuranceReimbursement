// Mock backend for drugs API
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Mock drug data
const drugs = [
  { name: '阿莫西林', rate: 80, desc: '医保报销80%' },
  { name: '布洛芬', rate: 70, desc: '医保报销70%' },
  { name: '头孢克肟', rate: 85, desc: '医保报销85%' },
  { name: '氯雷他定', rate: 60, desc: '医保报销60%' }
];

// Mock user data storage
const users = new Map();

// POST /login - WeChat login endpoint
app.post('/login', (req, res) => {
  const { code, userInfo } = req.body;
  
  // In a real implementation, you would:
  // 1. Send the code to WeChat API to get openid and session_key
  // 2. Store user info in database
  // 3. Return session token or openid
  
  // For now, we'll create a mock openid
  const mockOpenid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Store user info
  users.set(mockOpenid, {
    openid: mockOpenid,
    userInfo: userInfo,
    createdAt: new Date()
  });
  
  console.log('Login request received:', { code, userInfo });
  
  res.json({
    success: true,
    openid: mockOpenid,
    userInfo: userInfo || {
      nickName: '微信用户',
      avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDYwQzE2IDUwLjA1OSAyNC4wNTkgNDIgMzQgNDJINjZDNTUuOTQxIDQyIDQ4IDUwLjA1OSA0OCA2MFY2NkM0OCA2Ni41NTIgNDcuNTUyIDY3IDQ3IDY3SDMzQzMyLjQ0OCA2NyAzMiA2Ni41NTIgMzIgNjZWNjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
      gender: 0,
      country: '',
      province: '',
      city: '',
      language: 'zh_CN'
    }
  });
});

// GET /user/:openid - Get user info
app.get('/user/:openid', (req, res) => {
  const { openid } = req.params;
  const user = users.get(openid);
  
  if (user) {
    res.json({
      success: true,
      user: user
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

// GET /drugs - 获取药品列表
app.get('/drugs', (req, res) => {
  res.json({ data: drugs });
});

// GET /drug/detail - 获取药品详情
app.get('/drug/detail', (req, res) => {
  const { name } = req.query;
  const drug = drugs.find(d => d.name === name);
  if (drug) {
    res.json({
      name: drug.name,
      rate: drug.rate,
      self: 100 - drug.rate,
      desc: drug.desc
    });
  } else {
    res.status(404).json({ error: '未找到该药品' });
  }
});

app.listen(port, () => {
  console.log(`Mock drug backend running at http://localhost:${port}`);
});
