const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());
app.use(compression());

// 允许的域名列表
const allowedOrigins = [
  'http://localhost:3000',
  'http://590702.xyz',
  'https://590702.xyz',
  'http://590702.xyz:3000',
  'https://590702.xyz:3000'
];

// CORS配置
app.use(cors({
  origin: function(origin, callback) {
    // 允许没有来源的请求（比如移动端应用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`不允许的CORS源: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求日志
app.use(morgan('combined'));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));



// 路由配置
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/questions', require('./src/routes/questions'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/practice', require('./src/routes/practice'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/accidents', require('./src/routes/accidents'));
app.use('/api/schools', require('./src/routes/schools'));
app.use('/api/notifications', require('./src/routes/notifications'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    });
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // 默认错误
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📱 允许的域名: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api`);
  console.log(`💾 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
