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
