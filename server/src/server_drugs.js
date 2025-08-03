// Backend for drugs API using medicine_database.json
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Load medicine database from JSON file
let medicineDatabase = [];
try {
  const databasePath = path.join(__dirname, '../../medicine_database.json');
  const databaseContent = fs.readFileSync(databasePath, 'utf8');
  medicineDatabase = JSON.parse(databaseContent);
  console.log('Medicine database loaded successfully');
} catch (error) {
  console.error('Error loading medicine database:', error);
  medicineDatabase = { drug_categories: [] };
}

// Helper function to flatten all drugs from all categories
function getAllDrugs() {
  const allDrugs = [];
  medicineDatabase.drug_categories.forEach(category => {
    category.drugs.forEach(drug => {
      allDrugs.push({
        ...drug,
        category: category.药品分类,
        categoryCode: category.药品分类代码
      });
    });
  });
  return allDrugs;
}

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
  const allDrugs = getAllDrugs();
  res.json({ data: allDrugs });
});

// GET /drugs/categories - 获取药品分类列表
app.get('/drugs/categories', (req, res) => {
  const categories = medicineDatabase.drug_categories.map(category => ({
    code: category.药品分类代码,
    name: category.药品分类,
    drugCount: category.drugs.length
  }));
  res.json({ data: categories });
});

// GET /drugs/category/:code - 获取特定分类的药品
app.get('/drugs/category/:code', (req, res) => {
  const { code } = req.params;
  const category = medicineDatabase.drug_categories.find(cat => cat.药品分类代码 === code);
  
  if (category) {
    res.json({ data: category.drugs });
  } else {
    res.status(404).json({ error: '未找到该药品分类' });
  }
});

// GET /drug/detail - 获取药品详情
app.get('/drug/detail', (req, res) => {
  const { name } = req.query;
  const allDrugs = getAllDrugs();
  const drug = allDrugs.find(d => d.name === name);
  
  if (drug) {
    // Calculate reimbursement rate based on drug type (甲/乙)
    let rate = 0;
    let desc = '';
    
    if (drug.type === '甲') {
      rate = 80; // 甲类药品100%报销
      desc = '甲类药品，医保报销80%';
    } else if (drug.type === '乙') {
      rate = 60; // 乙类药品80%报销 (示例比例)
      desc = '乙类药品，医保报销60%';
    } else {
      rate = 0; // 其他类型不报销
      desc = '该药品不在医保报销范围内';
    }
    
    res.json({
      name: drug.name,
      type: drug.type,
      dosageForm: drug.剂型,
      category: drug.category,
      categoryCode: drug.categoryCode,
      rate: rate,
      self: 100 - rate,
      desc: desc,
      notes: drug.备注
    });
  } else {
    res.status(404).json({ error: '未找到该药品' });
  }
});

// GET /drug/search - 搜索药品
app.get('/drug/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: '搜索关键词不能为空' });
  }
  
  const allDrugs = getAllDrugs();
  const results = allDrugs.filter(drug => 
    drug.name.toLowerCase().includes(query.toLowerCase()) ||
    drug.category.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json({ data: results });
});

app.listen(port, () => {
  console.log(`Medicine database backend running at http://localhost:${port}`);
});
