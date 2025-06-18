const express = require('express');
const https = require('https');
const app = express();

// 解析JSON请求体
app.use(express.json());

// AI API调用函数
function callSiliconFlowAPI(prompt) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      model: "deepseek-ai/DeepSeek-R1", 
      messages: [{ 
        role: "user", 
        content: prompt 
      }],
      max_tokens: 4000, 
      enable_thinking:true,
      thinking_budget:4096, 
      temperature: 0,
      top_k: 5,
      stream: false
    });

    const options = {
      hostname: 'api.siliconflow.cn',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData),
        'User-Agent': 'TencentCloudFunction/WebFunction'
      },
      timeout: 60000  // 增加超时时间到60秒
    };

    console.log('🤖 调用SiliconFlow API...');
    const requestParams = JSON.parse(requestData);
    console.log('📊 请求参数:', { 
      model: requestParams.model, 
      max_tokens: requestParams.max_tokens,
      enable_thinking: requestParams.enable_thinking,
      thinking_budget: requestParams.thinking_budget,
      temperature: requestParams.temperature,
      top_k: requestParams.top_k
    });

    const req = https.request(options, (res) => {
      console.log('📡 API响应状态:', res.statusCode);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📦 接收数据长度:', data.length);
        
        try {
          if (res.statusCode !== 200) {
            console.error('❌ API错误:', res.statusCode, data);
            reject(new Error(`API错误: ${res.statusCode} - ${data}`));
            return;
          }
          
          const result = JSON.parse(data);
          console.log('✅ AI响应解析成功');
          
          if (result.choices && result.choices.length > 0) {
            const analysis = result.choices[0].message?.content || '分析结果为空';
            console.log('📝 AI分析长度:', analysis.length);
            resolve(analysis);
          } else if (result.error) {
            console.error('❌ AI返回错误:', result.error);
            reject(new Error(`AI错误: ${result.error.message || result.error}`));
          } else {
            console.error('❌ 未知响应格式:', result);
            reject(new Error('AI返回了未知格式的响应'));
          }
        } catch (parseError) {
          console.error('❌ JSON解析失败:', parseError.message);
          reject(new Error(`响应解析失败: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求错误:', error.message);
      reject(new Error(`网络错误: ${error.message}`));
    });

    req.on('timeout', () => {
      console.error('⏰ 请求超时');
      req.destroy();
      reject(new Error('请求超时，请重试'));
    });

    req.write(requestData);
    req.end();
  });
}

// 带重试的AI调用
async function callAIWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 第 ${i + 1} 次尝试调用AI...`);
      const result = await callSiliconFlowAPI(prompt);
      console.log(`✅ 第 ${i + 1} 次尝试成功`);
      return result;
    } catch (error) {
      console.error(`❌ 第 ${i + 1} 次尝试失败:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // 等待后重试
      const waitTime = 2000 * (i + 1);
      console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// CORS中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 根路径
app.get('/', (req, res) => {
  console.log('访问根路径');
  res.json({
    message: '八字分析API',
    status: 'running',
    timestamp: new Date().toISOString(),
    type: 'web-function'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  console.log('🏥 健康检查');
  console.log('🔑 API密钥状态:', !!process.env.SILICONFLOW_KEY);
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.SILICONFLOW_KEY,
    apiKeyLength: process.env.SILICONFLOW_KEY ? process.env.SILICONFLOW_KEY.length : 0
  });
});

// 八字分析API
app.post('/api/bazi', async (req, res) => {
  console.log('📦 请求体:', req.body);
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.log('❌ 缺少prompt参数');
      return res.json({
        code: -1,
        msg: '缺少参数',
        analysis: '请提供八字信息'
      });
    }
    
    console.log('📝 收到prompt，长度:', prompt.length);
    console.log('📄 Prompt内容预览:', prompt.substring(0, 100) + '...');
    
    // 检查API密钥
    if (!process.env.SILICONFLOW_KEY) {
      console.error('❌ 未配置SILICONFLOW_KEY环境变量');
      return res.json({
        code: -1,
        msg: '服务配置错误',
        analysis: '未配置AI服务密钥，请联系管理员配置SILICONFLOW_KEY环境变量'
      });
    }
    
    console.log('🔑 API密钥验证通过，长度:', process.env.SILICONFLOW_KEY.length);
    
    try {
      // 调用AI服务
      console.log('🚀 开始AI分析...');
      const analysis = await callAIWithRetry(prompt);
      console.log('🎉 AI分析完成');
      
      // 获取API调用参数
      const apiParams = {
        model: "deepseek-ai/DeepSeek-R1",
        max_tokens: 4000,
        enable_thinking: true,
        thinking_budget: 4096,
        temperature: 0,
        top_k: 5,
        stream: false
      };
      
      res.json({
        code: 0,
        msg: 'success',
        analysis: analysis,
        timestamp: new Date().toISOString(),
        api_params: apiParams  // 添加API参数到返回结果
      });
      
    } catch (aiError) {
      console.error('❌ AI调用失败:', aiError.message);
      
      // 根据错误类型返回不同提示
      let userMessage = '分析服务暂时不可用，请稍后重试';
      
      if (aiError.message.includes('API错误: 401')) {
        userMessage = 'API密钥无效，请联系管理员';
      } else if (aiError.message.includes('API错误: 429')) {
        userMessage = 'AI服务忙碌中，请稍后重试';
      } else if (aiError.message.includes('超时')) {
        userMessage = '分析超时，请重新尝试';
      } else if (aiError.message.includes('网络错误')) {
        userMessage = '网络连接异常，请检查网络后重试';
      }
      
      res.json({
        code: -1,
        msg: 'AI服务异常',
        analysis: `${userMessage}\n\n如果问题持续存在，请联系技术支持。\n\n错误详情: ${aiError.message}`
      });
    }
    
  } catch (error) {
    console.error('💥 处理异常:', error.message);
    console.error('💥 错误堆栈:', error.stack);
    res.json({
      code: -1,
      msg: 'error',
      analysis: '服务器内部错误，请稍后重试\n\n错误信息: ' + error.message
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: -1,
    msg: '路径不存在',
    path: req.path
  });
});

// 启动服务器
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Web函数启动成功，端口: ${port}`);
});

module.exports = app; 