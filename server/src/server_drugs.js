// Backend for drugs API using CSV medicine data
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Load CSV medicine reimbursement data
let csvMedicineData = [];
try {
  const csvPath = path.join(__dirname, '../Data/medical_reimbursement_western_medicine.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Parse CSV content (simple parsing for comma-separated values)
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 3) {
      csvMedicineData.push({
        medicine_name: values[0],
        reimbursement_class: values[1],
        uses: values[2]
      });
    }
  }
  
  console.log(`CSV medicine data loaded successfully: ${csvMedicineData.length} medicines`);
} catch (error) {
  console.error('Error loading CSV medicine data:', error);
  csvMedicineData = [];
}

// Helper function to get reimbursement rate based on class
function getReimbursementRate(reimbursementClass) {
  switch (reimbursementClass) {
    case '甲':
      return 80; // 甲类药品报销80%
    case '乙':
      return 60; // 乙类药品报销60%
    default:
      return 0;  // 其他类型不报销
  }
}

// Helper function to get all drugs from CSV data
function getAllDrugs() {
  return csvMedicineData.map(med => ({
    name: med.medicine_name,
    type: med.reimbursement_class,
    category: med.uses,
    rate: getReimbursementRate(med.reimbursement_class),
    self: 100 - getReimbursementRate(med.reimbursement_class),
    desc: `${med.reimbursement_class}类药品，医保报销${getReimbursementRate(med.reimbursement_class)}%`
  }));
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
  // Create categories from CSV data based on uses field
  const categories = {};
  csvMedicineData.forEach(drug => {
    if (!categories[drug.uses]) {
      categories[drug.uses] = 0;
    }
    categories[drug.uses]++;
  });
  
  const categoryList = Object.entries(categories).map(([name, count]) => ({
    code: name.substring(0, 4).toUpperCase(),
    name: name,
    drugCount: count
  }));
  
  res.json({ data: categoryList });
});

// GET /drugs/category/:code - 获取特定分类的药品
app.get('/drugs/category/:code', (req, res) => {
  const { code } = req.params;
  
  // Find drugs by category name (code is actually the category name)
  const drugsInCategory = csvMedicineData.filter(drug => 
    drug.uses === code
  );
  
  if (drugsInCategory.length > 0) {
    res.json({ data: drugsInCategory });
  } else {
    res.status(404).json({ error: '未找到该药品分类' });
  }
});

// GET /drug/detail - 获取药品详情
app.get('/drug/detail', (req, res) => {
  const { name } = req.query;
  const drug = csvMedicineData.find(d => d.medicine_name === name);
  
  if (drug) {
    const rate = getReimbursementRate(drug.reimbursement_class);
    let desc = '';
    
    if (drug.reimbursement_class === '甲') {
      desc = '甲类药品，医保报销80%';
    } else if (drug.reimbursement_class === '乙') {
      desc = '乙类药品，医保报销60%';
    } else {
      desc = '该药品不在医保报销范围内';
    }
    
    res.json({
      name: drug.medicine_name,
      type: drug.reimbursement_class,
      dosageForm: drug.uses,
      category: drug.uses,
      categoryCode: 'N/A',
      rate: rate,
      self: 100 - rate,
      desc: desc,
      notes: 'N/A'
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
  
  const results = csvMedicineData.filter(drug => 
    drug.medicine_name.toLowerCase().includes(query.toLowerCase()) ||
    drug.uses.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json({ data: results });
});

// POST /deepseek/query - DeepSeek API endpoint with CSV context
app.post('/deepseek/query', async (req, res) => {
  const { message, apiKey } = req.body;
  
  if (!message || !apiKey) {
    return res.status(400).json({ error: 'Message and API key are required' });
  }

  try {
    // Optimize: Only send relevant medicines instead of all 1601+
    // Look for medicines mentioned in the user's message
    const relevantMedicines = [];
    const userMessageLower = message.toLowerCase();
    
    // Find medicines that match the user's query
    csvMedicineData.forEach(med => {
      if (userMessageLower.includes(med.medicine_name.toLowerCase()) ||
          userMessageLower.includes(med.reimbursement_class) ||
          userMessageLower.includes(med.uses.toLowerCase())) {
        relevantMedicines.push(med);
      }
    });
    
    // If no specific medicines found, send a sample (first 50) instead of all 1601+
    const medicinesToSend = relevantMedicines.length > 0 ? 
      relevantMedicines : 
      csvMedicineData.slice(0, 50);
    
    // Create the context with relevant CSV data and reimbursement rules
    const context = `你是一个专业的医疗助手，专门帮助用户了解药品信息和医保报销政策。

重要报销规则：
- 甲类药品：医保报销80%
- 乙类药品：医保报销60%  
- 其他类型：医保报销0%（完全自费）

药品数据库信息（包含${medicinesToSend.length}种相关药品）：
${medicinesToSend.map(med => 
  `${med.medicine_name} - ${med.reimbursement_class}类 - ${med.uses} - 报销比例: ${getReimbursementRate(med.reimbursement_class)}%`
).join('\n')}

${relevantMedicines.length === 0 ? '注意：这是药品数据库的样本数据。如需查询其他药品，请提供具体药品名称。' : ''}

请用简洁、直接的方式回答用户的问题，保持回答专业但简明扼要。回答尽量控制在3句话以内，除非用户明确要求详细解释。当用户询问药品信息时，请参考上述数据库中的信息。`;

    // Prepare the request to DeepSeek
    const deepseekRequest = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: context
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    // Make request to DeepSeek API with increased timeout
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(deepseekRequest),
      // Increase timeout for large contexts
      signal: AbortSignal.timeout(30000) // 30 seconds
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage,
      medicinesSearched: relevantMedicines.length,
      totalMedicines: csvMedicineData.length
    });

  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    // Handle timeout specifically
    if (error.name === 'TimeoutError') {
      res.status(408).json({
        success: false,
        error: 'Request timeout - please try again',
        details: 'The request took too long to process. Try asking a more specific question.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get response from DeepSeek API',
        details: error.message
      });
    }
  }
});

// GET /csv-data - Get CSV medicine data for debugging
app.get('/csv-data', (req, res) => {
  res.json({
    success: true,
    count: csvMedicineData.length,
    data: csvMedicineData.slice(0, 20), // Return first 20 for preview
    reimbursementRules: {
      '甲': '80%',
      '乙': '60%',
      '其他': '0%'
    }
  });
});

app.listen(port, () => {
  console.log(`Medicine database backend running at http://localhost:${port}`);
});
