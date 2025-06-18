// 八字排盘分析系统 - 响应式布局版本

// 添加基础样式重置
document.head.innerHTML += `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    input:focus, select:focus, button:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    @media (max-width: 1024px) {
      .main-container {
        flex-direction: column !important;
        height: auto !important;
      }
      .left-panel, .right-panel {
        flex: none !important;
        min-height: 400px;
      }
    }
  </style>
`;

// 创建页面容器
document.body.innerHTML = `
  <div class="main-container" style="display: flex; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; gap: 20px;">
    <!-- 左侧：输入和排盘 (1/3) -->
    <div class="left-panel" style="flex: 1; background-color: #f8f9fa; border-radius: 12px; padding: 20px; overflow-y: auto; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="margin-top: 0; color: #333; text-align: center;">八字排盘</h2>
      
      <div style="background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; ">请输入生辰信息：</h3>
        <form id="baziForm">
          <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
            <label for="nickname" style="min-width: 50px; font-weight: 500;">昵称：</label>
            <input type="text" id="nickname" name="nickname" style="flex: 1; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;" placeholder="匿名" />
          </div>
          
          <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-weight: 500; margin-right: 4px;">生辰：</span>
            <input type="number" id="year" name="year" min="1900" max="2100" style="width: 70px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;" placeholder="1996" />
            <span>年</span>
            <input type="number" id="month" name="month" min="1" max="12" style="width: 50px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;" placeholder="6" />
            <span>月</span>
            <input type="number" id="day" name="day" min="1" max="31" style="width: 50px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;" placeholder="6" />
            <span>日</span>
            <input type="number" id="hour" name="hour" min="0" max="23" style="width: 50px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;" placeholder="6" />
            <span>时</span>
          </div>
          
          <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            <label for="sex" style="font-weight: 500;">性别：</label>
            <select id="sex" name="sex" required style="padding: 8px; border: 1px solid #ced4da; border-radius: 4px; background-color: white;">
              <option value="1">男</option>
              <option value="0">女</option>
            </select>
          </div>
          
          <button type="submit" style="width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'">开始排盘</button>
        </form>
        
        <div id="result" style="color: #333;"></div>
      </div>
    </div>
    
    <!-- 右侧：分析结果 (2/3) -->
    <div class="right-panel" style="flex: 2; background-color: #f8f9fa; border-radius: 12px; padding: 20px; overflow-y: auto; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="margin-top: 0; color: #333; text-align: center;">AI八字对话</h2>
      <div id="analysisResult" style="background-color: white; border-radius: 8px; padding: 20px; min-height: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #666; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
          <div style="font-size: 18px; color: #6c757d;">请先完成八字排盘，分析结果将在此显示</div>
        </div>
      </div>
    </div>
  </div>
`;

// 事件监听和处理逻辑
// =================== 全局五行配置函数 ===================
// 天干头像映射
const tianGanAvatars = {
  '甲': '🌲', '乙': '🌿', '丙': '☀️', '丁': '🕯️', '戊': '⛰️',
  '己': '🪨', '庚': '🗡️', '辛': '💍', '壬': '🌊', '癸': '💧'
};

// 地支头像映射
const diZhiAvatars = {
  '子': '💧', '丑': '🪨', '寅': '🌲', '卯': '🌿',
  '辰': '⛰️', '巳': '☀️', '午': '🕯️', '未': '🪨',
  '申': '🗡️', '酉': '💍', '戌': '⛰️', '亥': '🌊'
};

// 天干五行映射
const tianGanWuXing = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', 
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行映射
const diZhiWuXing = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 五行颜色映射
const wuxingColor = {
  '金': 'gold', '木': 'green', '水': 'blue',
  '火': 'red', '土': 'saddlebrown'
};

// 五行背景色映射（淡化版本）
const wuxingBgColor = {
  '金': '#fff8e1',    // 淡金色
  '木': '#e8f5e8',    // 淡绿色
  '水': '#e3f2fd',    // 淡蓝色
  '火': '#ffebee',    // 淡红色
  '土': '#efebe9'     // 淡棕色
};

// 五行相生映射
const wuxingSheng = {
  '金': '水',    // 金生水
  '水': '木',    // 水生木
  '木': '火',    // 木生火
  '火': '土',    // 火生土
  '土': '金'     // 土生金
};



document.addEventListener('DOMContentLoaded', function() {
document.getElementById('baziForm').addEventListener('submit', function(e) {
  e.preventDefault();
    function getValueOrPlaceholder(id) {
      var el = document.getElementById(id);
      return el.value ? el.value : el.placeholder;
    }
    const nickname = getValueOrPlaceholder('nickname');
    const year = getValueOrPlaceholder('year');
    const month = getValueOrPlaceholder('month');
    const day = getValueOrPlaceholder('day');
    const hour = getValueOrPlaceholder('hour');
  const sex = document.getElementById('sex').value;

    let resultDiv = document.getElementById('result');
    if (typeof Bazi === 'function') {
      const bazi = new Bazi(year, month, day, hour, sex);
      // 获取四柱
      const zhus = [
        { label: '年柱', zhu: bazi.yZhu() },
        { label: '月柱', zhu: bazi.mZhu() },
        { label: '日柱', zhu: bazi.dZhu() },
        { label: '时柱', zhu: bazi.hZhu() }
      ];
      let html = `<br><br><h3 style="margin-top: 0; ">您的八字盘是：</h3>`;
      html += `<table style='border-collapse:collapse;margin-bottom:8px;font-size:16px;'>`;
      html += `<tr><th style='padding:2px 8px;'></th><th style='padding:2px 8px;'>年</th><th style='padding:2px 8px;'>月</th><th style='padding:2px 8px;'>日</th><th style='padding:2px 8px;'>时</th></tr>`;
      // 天干行
      html += `<tr><td style='text-align:right;font-weight:bold;'>天干：</td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.wuXing(zhus[0].zhu[0])]}'>${zhus[0].zhu[0]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.wuXing(zhus[1].zhu[0])]}'>${zhus[1].zhu[0]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.wuXing(zhus[2].zhu[0])]}'>${zhus[2].zhu[0]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.wuXing(zhus[3].zhu[0])]}'>${zhus[3].zhu[0]}</span></td></tr>`;
      // 地支行
      html += `<tr><td style='text-align:right;font-weight:bold;'>地支：</td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.zhiWuXing(zhus[0].zhu[1])]}'>${zhus[0].zhu[1]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.zhiWuXing(zhus[1].zhu[1])]}'>${zhus[1].zhu[1]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.zhiWuXing(zhus[2].zhu[1])]}'>${zhus[2].zhu[1]}</span></td>`;
      html += `<td style='text-align:center;'><span style='color:${wuxingColor[bazi.zhiWuXing(zhus[3].zhu[1])]}'>${zhus[3].zhu[1]}</span></td></tr>`;
      html += `</table>`;
      
              html += `<div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; font-size: 12px; color: #6c757d; line-height: 1.6;">
        <strong style="color: #495057;">为什么和AI给我排的盘不一样？</strong><br>
        如果和AI排盘的结果对比不一致，可能是AI幻觉影响了排盘结果。<br>本页面采用规则排盘、更为准确，与专业软件（如测测、问真等）相同。
      </div>`;

      resultDiv.innerHTML = html;

      // 组装 prompt
      const sexStr = sex == 1 ? "男" : "女";
      const gans = [bazi.yGan(), bazi.mGan(), bazi.dGan(), bazi.hGan()];
      const zhis = [bazi.yZhi(), bazi.mZhi(), bazi.dZhi(), bazi.hZhi()];

      const prompt = 

        `天干：${gans.join(' ')}\n` +
        `地支：${zhis.join(' ')}\n\n` +
        `请模拟八字中八个角色的对话：\n` +
        `- 年干（${gans[0]}）\n` +
        `- 年支（${zhis[0]}）\n` +
        `- 月干（${gans[1]}）\n` +
        `- 月支（${zhis[1]}）\n` +
        `- 日主（${gans[2]}）\n` +
        `- 日支（${zhis[2]}）\n` +
        `- 时干（${gans[3]}）\n` +
        `- 时支（${zhis[3]}）\n\n` +
        `参考《穷通宝典》、《三命通会》、《滴天髓》、《渊海子平》、《千里命稿》、《协纪辨方书》、《果老星宗》、《子平真诠》、《神峰通考》等知识。\n` +
        `- 以"日主（${gans[2]}）"开头，介绍什么是日主、在生命中起到的作用、它的属性代表的个人特质。其他角色按年干、年支、月干、月支、日支、时干、时支顺序轮流发言\n` +
        `每个角色依次发言，内容包括（：\n` +
        `1. 自己的五行意向\n` +
        `2. 自己的五行与命主五行的关系（生助泻克耗），先不要使用十神的词汇，只用生助泻克耗对应的意向\n` +        
        `3. 自己所处的位置，位置的意义，如在命主生活中代表的角色、对应的年龄阶段\n` +
        `4. 可能透露命主的性格特征或者天赋\n` +
        `要求：\n` +
        `- 用通俗易懂的语言描述。\n` +
        `- 每段都以"干支（天干地支）："开始，这是重要的角色标识，例如"年干（丙）："表示这一段是描述年干丙火的特征\n` +
        `请直接输出角色对话内容，角色名称保持形如年干（${gans[0]}），不要有其他名称。只输出角色对话内容。总结性的话语通过 日主（${gans[2]}） 角色说出 。不要出现对话之外的提示性词语。`;

      console.log(prompt);

      // 获取日主五行和生它的五行
      const riZhuWuXing = bazi.wuXing(zhus[2].zhu[0]); // 日主五行
      let shengRiZhuWuXing = null; // 生日主的五行
      
      // 找到生日主的五行（反向查找五行相生关系）
      for (const [sheng, bei] of Object.entries(wuxingSheng)) {
        if (bei === riZhuWuXing) {
          shengRiZhuWuXing = sheng;
          break;
        }
      }
      
      console.log('日主五行:', riZhuWuXing);
      console.log('生日主的五行:', shengRiZhuWuXing);

      // 获取右侧分析结果容器
      const analysisContainer = document.getElementById('analysisResult');
      
      // 显示加载状态
      analysisContainer.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
          <div style="font-size: 18px; color: #6c757d;">正在分析八字，请稍候...</div>
          <div style="margin-top: 10px; font-size: 14px; color: #adb5bd;">AI正在为您生成个性化分析</div>
        </div>
      `;

      // =================== 真实API调用 ===================
      // 直接调用腾讯云函数API
      const apiUrl = 'https://1304504613-7y9pj4x0nx.ap-guangzhou.tencentscf.com/api/bazi';
      
      console.log('调用腾讯云函数:', apiUrl);
      
      // 开始API调用
      fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })
      .then(async response => {
        console.log('响应状态:', response.status, response.statusText);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));
        
        // 获取响应文本
        const responseText = await response.text();
        console.log('响应原始内容:', responseText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        
        // 尝试解析JSON
        try {
          return JSON.parse(responseText);
        } catch (jsonError) {
          console.error('JSON解析失败:', jsonError);
          throw new Error(`服务器返回了非JSON格式的响应: ${responseText.substring(0, 100)}...`);
        }
      })
      .then(data => {
        console.log('解析后的数据:', data);
        
        // 处理分析结果，按聊天框形式显示
        function formatAnalysisResult(text, currentRiZhuWuXing = riZhuWuXing, currentShengRiZhuWuXing = shengRiZhuWuXing) {
          console.log('formatAnalysisResult 被调用，参数:', { text: text.substring(0, 100) + '...', currentRiZhuWuXing, currentShengRiZhuWuXing });
          console.log('完整文本内容:', text);
          
          // 按换行符分割段落（包括单换行符和双换行符），并过滤掉包含 --- 分割线的段落
          const paragraphs = text.split(/\n+/).filter(p => p.trim() && !p.trim().includes('---'));
          console.log('分割后的段落数量:', paragraphs.length);
          console.log('段落内容:', paragraphs);
          
          let formattedHTML = ``;
          
          paragraphs.forEach((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            
            // 跳过包含分割线的段落
            if (trimmedParagraph.includes('---')) {
              return;
            }
            
            // 检查是否是发言者格式（如："日主（丙）："）
            const speakerMatch = trimmedParagraph.match(/^([^：]+)：(.+)$/s);
            
            if (speakerMatch) {
              const speaker = speakerMatch[1];
              const content = speakerMatch[2];
              console.log('识别角色:', speaker, '内容长度:', content.length);
              
              // 直接使用映射获取角色信息
              const bracketMatch = speaker.match(/（(.+)）/);
              let avatar = '👤'; // 默认头像
              let wuxing = null;
              let textColor = '#1976d2';
              let bgColor = '#e3f2fd';
              
              if (bracketMatch) {
                const ganZhi = bracketMatch[1];
                console.log('解析角色:', speaker, '提取干支:', ganZhi);
                
                // 优先匹配天干
                if (tianGanAvatars[ganZhi]) {
                  avatar = tianGanAvatars[ganZhi];
                  wuxing = tianGanWuXing[ganZhi];
                  console.log('匹配天干:', ganZhi, '头像:', avatar, '五行:', wuxing);
                } else if (diZhiAvatars[ganZhi]) {
                  avatar = diZhiAvatars[ganZhi];
                  wuxing = diZhiWuXing[ganZhi];
                  console.log('匹配地支:', ganZhi, '头像:', avatar, '五行:', wuxing);
                } else {
                  console.log('未匹配到干支:', ganZhi);
                }
                
                // 根据五行设置颜色
                if (wuxing && wuxingColor[wuxing] && wuxingBgColor[wuxing]) {
                  textColor = wuxingColor[wuxing];
                  bgColor = wuxingBgColor[wuxing];
                  console.log('设置颜色:', wuxing, 'textColor:', textColor, 'bgColor:', bgColor);
                }
              }
              
              // 判断是否是"同我生我"的五行（从右侧发出）
              // 找出哪些五行生日主（使用全局的wuxingSheng映射）
              let shengWoWuxing = null;
              for (let [sheng, bei] of Object.entries(wuxingSheng)) {
                if (bei === currentRiZhuWuXing) {
                  shengWoWuxing = sheng;
                  break;
                }
              }
              
              // 同我（相同五行）或生我（生日主的五行）右侧发言
              const isRightSide = wuxing === currentRiZhuWuXing || wuxing === shengWoWuxing;
              console.log('判断右侧:', { wuxing, currentRiZhuWuXing, shengWoWuxing, isRightSide });
              
              // 聊天气泡样式
              if (isRightSide) {
                // 右侧消息（日主和生日主的五行）
                formattedHTML += `
                  <div style="display: flex; margin-bottom: 12px; align-items: flex-start; gap: 8px; flex-direction: row-reverse;">
                    <!-- 头像 -->
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid ${textColor}; flex-shrink: 0;">
                      ${avatar}
                    </div>
                    
                    <!-- 消息内容 -->
                    <div style="max-width: 70%; display: flex; flex-direction: column; align-items: flex-end;">
                      <!-- 昵称 -->
                      <div style="font-size: 10px; color: ${textColor}; font-weight: 600; margin-bottom: 4px;">
                        ${speaker.replace(/\*/g, '')}
                      </div>
                      
                      <!-- 聊天气泡 -->
                      <div style="background: ${bgColor}; border: 1px solid ${textColor}40; border-radius: 16px 16px 4px 16px; padding: 10px 14px; color: #333; line-height: 1.5; font-size: 13px; word-wrap: break-word; text-align: left;">
                        ${content}
                      </div>
                    </div>
                  </div>
                `;
              } else {
                // 左侧消息（其他五行）
                formattedHTML += `
                  <div style="display: flex; margin-bottom: 12px; align-items: flex-start; gap: 8px;">
                    <!-- 头像 -->
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid ${textColor}; flex-shrink: 0;">
                      ${avatar}
                    </div>
                    
                    <!-- 消息内容 -->
                    <div style="max-width: 70%; display: flex; flex-direction: column; align-items: flex-start;">
                      <!-- 昵称 -->
                      <div style="font-size: 10px; color: ${textColor}; font-weight: 600; margin-bottom: 4px;">
                        ${speaker.replace(/\*/g, '')}
                      </div>
                      
                      <!-- 聊天气泡 -->
                      <div style="background-color: white; border: 1px solid ${textColor}40; border-radius: 16px 16px 16px 4px; padding: 10px 14px; color: #333; line-height: 1.5; font-size: 13px; word-wrap: break-word; text-align: left;">
                        ${content}
                      </div>
                    </div>
                  </div>
                `;
              }
            } else {
              // 系统消息样式
              formattedHTML += `
                <div style="text-align: center; margin: 15px 0;">
                  <div style="display: inline-block; background-color: #e9ecef; color: #6c757d; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 500; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${trimmedParagraph}
                  </div>
                </div>
              `;
            }
          });
          
          // 只在基础分析中显示进阶按钮
          if (currentRiZhuWuXing === riZhuWuXing && currentShengRiZhuWuXing === shengRiZhuWuXing) {
            formattedHTML += `
              <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <button id="advancedAnalysisBtn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                  🔮 进阶内容
                </button>
              </div>
            `;
          }
          return formattedHTML;
        }
        
        // 显示分析结果
        analysisContainer.innerHTML = `
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; border: none; min-height: 200px; display: block; width: 100%;">
            ${formatAnalysisResult(data.analysis || data.msg || '分析结果为空')}
          </div>
        `;
        
        // 保存第一次分析的对话历史
        const conversationHistory = [
          { role: "user", content: prompt },
          { role: "assistant", content: data.analysis || data.msg || '分析结果为空' }
        ];
        
        // 为进阶内容按钮添加事件监听器
        setTimeout(() => {
          const advancedBtn = document.getElementById('advancedAnalysisBtn');
          if (advancedBtn) {
            advancedBtn.addEventListener('click', function() {
              // 显示加载状态
              this.disabled = true;
              this.innerHTML = '🔄 分析中...';
              this.style.opacity = '0.7';
              
              // 构建进阶分析的prompt
              const advancedPrompt = 
              `天干：${gans.join(' ')}\n` +
              `地支：${zhis.join(' ')}\n\n` +
              `请模拟八字中八个角色的对话：\n` +
              `- 年干（${gans[0]}）\n` +
              `- 年支（${zhis[0]}）\n` +
              `- 月干（${gans[1]}）\n` +
              `- 月支（${zhis[1]}）\n` +
              `- 日主（${gans[2]}）\n` +
              `- 日支（${zhis[2]}）\n` +
              `- 时干（${gans[3]}）\n` +
              `- 时支（${zhis[3]}）\n\n` +

                `请用以上八个角色的口吻，阐释以下问题：\n` +
                `1. 五行旺衰分析：分析各五行的强弱程度\n` +
                `2. 十神身份：每个角色的十神身份、和命主的生助泻克耗关系，可能对应的人生经历、天赋、性格\n` +
                `3. 格局分析：是否有角色间作用形成格局\n` +
                `5. 事业财运（选答，没有可以不答）：分析适合的职业方向和财运特征\n` +
                `6. 婚姻感情（选答，没有可以不答）：分析感情和婚姻的特点\n` +
                `7. 健康状况（选答，没有可以不答）：根据五行平衡分析身体健康倾向\n\n` +
                `请用角色对话的形式输出，发言不限制顺序，按相关性、专业角度回答。\n` +
                `要求：语言专业但通俗易懂，重点突出实用性建议。
                请直接输出角色对话内容，角色名称保持形如：年干（${gans[0]}），不要有其他名称。只输出角色对话内容。总结性的话语通过 日主（${gans[2]}） 角色说出 。不要出现对话之外的提示性词语。`;
              
              console.log('进阶分析prompt:', advancedPrompt);
              
              // 构建包含对话历史的messages数组
              const messagesWithHistory = [
                ...conversationHistory,
                { role: "user", content: advancedPrompt }
              ];
              
              console.log('发送对话历史，包含', messagesWithHistory.length, '条消息');
              
              // 调用进阶分析API（使用对话历史）
              fetch(apiUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                  prompt: advancedPrompt,  // 保持向后兼容
                  messages: messagesWithHistory  // 传递对话历史
                })
              })
              .then(async response => {
                if (!response.ok) {
                  const responseText = await response.text();
                  throw new Error(`HTTP ${response.status}: ${responseText}`);
                }
                return response.json();
              })
              .then(advancedData => {
                // 移除进阶按钮
                const advancedBtn = document.getElementById('advancedAnalysisBtn');
                if (advancedBtn && advancedBtn.parentNode) {
                  advancedBtn.parentNode.remove();
                }
                
                // 创建进阶分析的独立内容区块（使用相同的头像和颜色逻辑）
                console.log('进阶分析中的riZhuWuXing:', riZhuWuXing, 'shengRiZhuWuXing:', shengRiZhuWuXing);
                console.log('进阶分析数据:', advancedData.analysis || advancedData.msg || '进阶分析结果为空');
                const advancedContent = formatAnalysisResult(advancedData.analysis || advancedData.msg || '进阶分析结果为空', riZhuWuXing, shengRiZhuWuXing);
                
                // 在现有聊天区域添加分隔线和进阶分析内容
                const currentChatContainer = analysisContainer.querySelector('div[style*="background-color: #f8f9fa"]');
                
                // 创建分隔线元素
                const separatorDiv = document.createElement('div');
                separatorDiv.style.cssText = 'text-align: center; margin: 25px 0;';
                separatorDiv.innerHTML = `
                  <div style="display: inline-block; background-color: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; border: none; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                    ✨ 进阶深度分析开始 ✨
                  </div>
                `;
                
                // 创建进阶分析内容容器
                const advancedContentDiv = document.createElement('div');
                advancedContentDiv.innerHTML = advancedContent;
                
                // 使用appendChild添加元素，而不是修改innerHTML
                currentChatContainer.appendChild(separatorDiv);
                currentChatContainer.appendChild(advancedContentDiv);
              })
              .catch(advancedErr => {
                console.error('进阶分析请求失败:', advancedErr);
                this.disabled = false;
                this.innerHTML = '🔮 进阶内容';
                this.style.opacity = '1';
                
                // 显示错误提示
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'margin-top: 10px; padding: 10px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; color: #721c24; font-size: 12px;';
                errorDiv.innerHTML = `进阶分析请求失败: ${advancedErr.message}`;
                this.parentNode.appendChild(errorDiv);
                
                setTimeout(() => {
                  if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                  }
                }, 5000);
              });
            });
          }
        }, 100);
      })
      .catch(err => {
        console.error('API请求失败:', err);
        
        // 显示详细错误信息
        analysisContainer.innerHTML = `
          <div style="text-align: left;">
            <div style="font-size: 48px; margin-bottom: 16px; text-align: center;">⚠️</div>
            <div style="font-size: 18px; color: #dc3545; margin-bottom: 15px; text-align: center;">分析请求失败</div>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb; margin-bottom: 15px;">
              <strong style="color: #721c24;">错误详情:</strong><br>
              <code style="font-size: 13px; color: #721c24; word-break: break-all;">${err.message || err}</code>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border: 1px solid #bee5eb; font-size: 14px;">
              <strong style="color: #0c5460;">可能的解决方案:</strong><br>
              1. 检查云函数是否正常运行<br>
              2. 确认API网关配置正确<br>
              3. 验证SILICONFLOW_KEY环境变量<br>
              4. 稍后重试
            </div>
          </div>
        `;
      });
      
    } else {
      resultDiv.innerText = '未找到Bazi函数，无法计算八字。';
    }
  });
});

// 回车跳到下一个输入框
function setInputTabOrder() {
  const ids = ['nickname', 'year', 'month', 'day', 'hour'];
  for (let i = 0; i < ids.length; i++) {
    const input = document.getElementById(ids[i]);
    if (!input) continue;
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (i < ids.length - 1) {
          const next = document.getElementById(ids[i + 1]);
          if (next) next.focus();
        } else {
          // 最后一个输入框，提交表单
          document.getElementById('baziForm').requestSubmit();
        }
      }
    });
  }
}
setInputTabOrder();



function Bazi(y,m,d,h,sex){
	var y=Number(y);
	var m=m-1;
	var d=Number(d);
	var h=Number(h);
	var sex=Number(sex);
	var y_d=new Date();
        y_d.setFullYear(y);
      	y_d.setMonth(m);
      	y_d.setDate(d);
      	y_d.setHours(h);
      	y_d.setMinutes(0);
      	y_d.setSeconds(0);
    var y_t=y_d.getTime();
    var tg=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var dz=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var dz0=["丑","寅","卯","辰","巳","午","未","申","酉","戌","亥","子"];
    var jq=["小寒","立春","惊蛰","清明","立夏","芒种","小暑","立秋","白露","寒露","立冬","大雪"];
    var jq84=[442208451146,444755924716,447326679845,449936540593,452591457618,455285317308,458000946032,460714673166,463403390187,466051355952,468654332864,471220083199];
    var y_d84=441734400726;
    var zsss={
        "甲":["沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养","长生"],
        "乙":["病","衰","帝旺","临官","冠带","沐浴","长生","养","胎","绝","墓","死"],
        "丙":["胎","养","长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝"],
        "丁":["绝","墓","死","病","衰","帝旺","临官","冠带","沐浴","长生","养","胎"],
        "戊":["胎","养","长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝"],
        "己":["绝","墓","死","病","衰","帝旺","临官","冠带","沐浴","长生","养","胎"],
        "庚":["死","墓","绝","胎","养","长生","沐浴","冠带","临官","帝旺","衰","病"],
        "辛":["长生","养","胎","绝","墓","死","病","衰","帝旺","临官","冠带","沐浴"],
        "壬":["帝旺","衰","病","死","墓","绝","胎","养","长生","沐浴","冠带","临官"],
        "癸":["临官","冠带","沐浴","长生","养","胎","绝","墓","死","病","衰","帝旺"]
    }
    var nayi={
        "甲子":["海中金"], "乙丑":["海中金"], "丙寅":["炉中火"], "丁卯":["炉中火"], "戊辰":["大林木"], "己巳":["大林木"], "庚午":["路旁土"], "辛未":["路旁土"], "壬申":["剑锋金"], "癸酉":["剑锋金"],
        "甲戌":["山头火"], "乙亥":["山头火"], "丙子":["涧下水"], "丁丑":["涧下水"], "戊寅":["城墙土"], "己卯":["城墙土"], "庚辰":["白腊金"], "辛巳":["白腊金"], "壬午":["杨柳木"], "癸未":["杨柳木"],
        "甲申":["泉中水"], "乙酉":["泉中水"], "丙戌":["屋上土"], "丁亥":["屋上土"], "戊子":["霹雳火"], "己丑":["霹雳火"], "庚寅":["松柏木"], "辛卯":["松柏木"], "壬辰":["长流水"], "癸巳":["长流水"],
        "甲午":["沙中金"], "乙未":["沙中金"], "丙申":["山下火"], "丁酉":["山下火"], "戊戌":["平地木"], "己亥":["平地木"], "庚子":["壁上土"], "辛丑":["壁上土"], "壬寅":["金箔金"], "癸卯":["金箔金"],
        "甲辰":["覆灯火"], "乙巳":["覆灯火"], "丙午":["天河水"], "丁未":["天河水"], "戊申":["大驿土"], "己酉":["大驿土"], "庚戌":["钗钏金"], "辛亥":["钗钏金"], "壬子":["桑柘木"], "癸丑":["桑柘木"],
        "甲寅":["大溪水"], "乙卯":["大溪水"], "丙辰":["沙中土"], "丁巳":["沙中土"], "戊午":["天上火"], "己未":["天上火"], "庚申":["石榴木"], "辛酉":["石榴木"], "壬戌":["大海水"], "癸亥":["大海水"]
    }
	var cangdun={
        "子":["癸",48],
        "丑":["己",16,"癸",8,"辛",4],
        "寅":["甲",32,"丙",16,"戊",8],
        "卯":["乙",48],
        "辰":["戊",16,"乙",8,"壬",8],
        "巳":["丙",32,"庚",8,"戊",8],
        "午":["丁",48,"己",24],
        "未":["己",32,"丁",8,"乙",8],
        "申":["庚",32,"壬",16,"戊",8],
        "酉":["辛",48],
        "戌":["戊",32,"丁",8,"辛",8],
        "亥":["壬",32,"甲",16]
	}
	this.yGan = function() { // 年干
		return tg[(y - 1864) % 10];
	}
	this.yZhi = function() { // 年支
		return dz[(y - 1864) % 12];
	}
	this.yZhu=function(){  //年柱
		return this.yGan()+this.yZhi();
	}
	this.mGan=function(){  //月干
		var ng=this.yGan();
		var yg;
		if(ng=="甲"||ng=="己") yg=tg[(1+m)%10];
        if(ng=="乙"||ng=="庚") yg=tg[(3+m)%10];
        if(ng=="丙"||ng=="辛") yg=tg[(5+m)%10];
        if(ng=="丁"||ng=="壬") yg=tg[(7+m)%10];
        if(ng=="戊"||ng=="癸") yg=tg[(9+m)%10];
        if(y_t<((y-1984)*31556926009+jq84[m])){
            (tg.indexOf(yg)-1)==-1?yg=tg[9]:yg=tg[tg.indexOf(yg)-1];
        }
        return yg;
	}
	this.mZhi = function() { // 月支
		// 以农历正月为寅月，公历1月、2月通常为上一年腊月和正月，需结合节气判断
		// 简化版：假设输入的m为1-12，正月为寅
		return dz[(m + 1) % 12];
	}
	this.mZhu=function(){  //月柱
		return this.mGan()+this.mZhi();
	}
	this.dGan=function(){  //日干
		var y_r=Math.floor((y_t-y_d84)/86400000)%60;
      	var rg;
      	y_r>=0?rg=tg[y_r%10]:rg=tg[(4+(60+y_r)%10)%10];
        return rg;
	}
	this.dZhi=function(){  //日支
		var y_r=Math.floor((y_t-y_d84)/86400000)%60;
      	var rz;
      	y_r>=0?rz=dz0[(5+y_r%12)%12]:rz=dz0[(5+(60+y_r)%12)%12];
      	return rz;
	}
	this.dZhu=function(){  //日柱
		return this.dGan()+this.dZhi();
	}
	this.hGan=function(){  //时干
		var rg=this.dGan();
		var sz=this.hZhi();
		var sg;
		if(rg=="甲"||rg=="己") sg=tg[(1+dz0.indexOf(sz))%10];
        if(rg=="乙"||rg=="庚") sg=tg[(3+dz0.indexOf(sz))%10];
        if(rg=="丙"||rg=="辛") sg=tg[(5+dz0.indexOf(sz))%10];
        if(rg=="丁"||rg=="壬") sg=tg[(7+dz0.indexOf(sz))%10];
        if(rg=="戊"||rg=="癸") sg=tg[(9+dz0.indexOf(sz))%10];
        return sg;
	}
	this.hZhi=function(){  //时支
		var sz;
        if(h>=0) sz=dz0[11];
        if(h>=1) sz=dz0[0];
        if(h>=3) sz=dz0[1];
        if(h>=5) sz=dz0[2];
        if(h>=7) sz=dz0[3];
        if(h>=9) sz=dz0[4];
        if(h>=11) sz=dz0[5];
        if(h>=13) sz=dz0[6];
        if(h>=15) sz=dz0[7];
        if(h>=17) sz=dz0[8];
        if(h>=19) sz=dz0[9];
        if(h>=21) sz=dz0[10];
        if(h>=23) sz=dz0[11];
        return sz;
	}
	this.hZhu=function(){  //时柱
		return this.hGan()+this.hZhi();
	}
	this.xunKong=function(){  //旬空
		var xtg=tg.indexOf(this.dGan());
        var xdz=dz.indexOf(this.dZhi());
        var xunk;
        if((xtg-xdz)==0) xunk=dz[10]+dz[11];
        if((xtg-xdz)==-10||(xtg-xdz)==2) xunk=dz[8]+dz[9];
        if((xtg-xdz)==-8||(xtg-xdz)==4) xunk=dz[6]+dz[7];
        if((xtg-xdz)==-6||(xtg-xdz)==6)	xunk=dz[4]+dz[5];
        if((xtg-xdz)==-4||(xtg-xdz)==8)	xunk=dz[2]+dz[3];
        if((xtg-xdz)==-2)	xunk=dz[0]+dz[1];
        return xunk;
	}
	this.daYun=function(){  //大运
        //  大运
        var dyg=[];
        var tg1=tg.concat(tg);
        var dyz=[];
        var dz1=dz.concat(dz);
        var ng=this.yGan();
        var yg=this.mGan();
        var yz=this.mZhi();
        var dyun=[];
        //大运天干
        if(((tg.indexOf(ng))%2==0 && sex==1)||((tg.indexOf(ng))%2==1 && sex==0)){
    		for(var n=(tg1.indexOf(yg))+1; n<20; n++){
                dyg.push(tg1[n]);
                dyg.splice(8,22);
    		}
        }
        if(((tg.indexOf(ng))%2==1 && sex==1)||((tg.indexOf(ng))%2==0 && sex==0)){
    		tg1.reverse();
    		for(var n=(tg1.indexOf(yg))+1; n<20; n++){ 
                dyg.push(tg1[n]);
                dyg.splice(8,22);
    		}
        }
        //大运地支
        if(((tg.indexOf(ng))%2==0 && sex==1)||((tg.indexOf(ng))%2==1 && sex==0)){
    		for(var n=(dz1.indexOf(yz))+1; n<24; n++){
                dyz.push(dz1[n]);
                dyz.splice(8,26);
    		}
        }
        if(((tg.indexOf(ng))%2==1 && sex==1)||((tg.indexOf(ng))%2==0 && sex==0)){
    		dz1.reverse();
    		for(var n=(dz1.indexOf(yz))+1; n<24; n++){
                dyz.push(dz1[n]);
                dyz.splice(8,26);
    		}
        }
        for (i in dyg){
            dyun.push(dyg[i]+dyz[i]);
        }
        return dyun;
	}
	this.qiYun=function(){  //起运
        var qiy;
        if(y_t<((y-1984)*31556926009+jq84[m])){
          var jnianm=(((y-1984)*31556926009+jq84[m])-y_t)/259200000;
          var jniann=(y_t-((y-1984)*31556926009+jq84[m-1]))/259200000;
        }else{
          var jnianm=(((y-1984)*31556926009+jq84[m+1])-y_t)/259200000;
          var jniann=(y_t-((y-1984)*31556926009+jq84[m]))/259200000;
        }
        (sex==1 && y%2==0)?qiy=Math.round(jnianm):qiy=Math.round(jniann);
        (sex==0 && y%2==1)?qiy=Math.round(jnianm):qiy=Math.round(jniann);
        return qiy;
	}
	this.liuNian=function(){  //流年
		var n=this.qiYun();
	    var l=parseInt(y)+parseInt(n);
	    var g,z;
	    var lgz=[];
        for(var n=0;n<80;n++){
            g=tg[(l+6)%10];
            if(l-1984<=0) z=dz0[11+(l-1984)%12];
            if(l-1984>0) ((l-1984)%12-1)==-1?z=dz0[11]:z=dz0[(l-1984)%12-1];
            lgz.push(g+z);
            l=l+1;
        }
        return lgz;          
	}
	this.shiShen=function(g){  //十神
        var sn;
        var cn=tg.indexOf(g);
        var shi=tg.indexOf(this.dGan());
        if((shi%2)==0){
        if((cn-shi)==-5||(cn-shi)==5) sn="财";
        if((cn-shi)==-4||(cn-shi)==6) sn="杀";
        if((cn-shi)==-3||(cn-shi)==7) sn="官";
        if((cn-shi)==-2||(cn-shi)==8) sn="枭";
        if((cn-shi)==-1||(cn-shi)==9) sn="印";
        if((cn-shi)==0) sn="比";
        if((cn-shi)==1||(cn-shi)==-9) sn="劫";
        if((cn-shi)==2||(cn-shi)==-8) sn="食";
        if((cn-shi)==3||(cn-shi)==-7) sn="伤";
        if((cn-shi)==4||(cn-shi)==-6) sn="才";
        }
       if((shi%2)==1){
        if((cn-shi)==-5||(cn-shi)==5) sn="官";
        if((cn-shi)==-4||(cn-shi)==6) sn="杀";
        if((cn-shi)==-3||(cn-shi)==7) sn="印";
        if((cn-shi)==-2||(cn-shi)==8) sn="枭";
        if((cn-shi)==-1||(cn-shi)==9) sn="劫";
        if((cn-shi)==0) sn="比";
        if((cn-shi)==1||(cn-shi)==-9) sn="伤";
        if((cn-shi)==2||(cn-shi)==-8) sn="食";
        if((cn-shi)==3||(cn-shi)==-7) sn="财";
        if((cn-shi)==4||(cn-shi)==-6) sn="才";
       }
       return sn;
    }
	this.xingBie=function(){  //性别
		var qk;
		sex==0?qk="坤造":qk="乾造"; 
		return qk;
	}
	this.naYin=function(zhu){  //纳音
        var na=[];
        na=na.concat(nayi[zhu]); 
        return na[0];
    }
    this.shuaiWang=function(g,z){  //旺衰
        var zz=dz.indexOf(z);
        var sr=zsss[g][zz];
        return sr;
    }
    this.wuXing=function(gan){  //五行
    	var wux="";
        if(gan=="甲"||gan=="乙") wux="木";
        if(gan=="丙"||gan=="丁") wux="火";
        if(gan=="戊"||gan=="己") wux="土";
        if(gan=="庚"||gan=="辛") wux="金";
        if(gan=="壬"||gan=="癸") wux="水";
        return wux;
    }
	this.cangGan=function(zhi){
		var z=cangdun[zhi];
		console.log(z);
		var zh=[];
		for (var i=0;i<z.length; i++){
		    if(i%2==0)zh.push(z[i]);
		}
		return zh;
	}
	this.ng=this.yGan();
	this.yg=this.mGan();
	this.rg=this.dGan();
	this.sg=this.hGan();
	this.nz=this.yZhi();
	this.yz=this.mZhi();
	this.rz=this.dZhi();
	this.sz=this.hZhi();
	this.xk=this.xunKong();
	this.qk=this.xingBie();
    // 地支五行判断方法
    this.zhiWuXing = function(zhi) {
      const zhi2wx = {
        "子": "水",
        "丑": "土",
        "寅": "木",
        "卯": "木",
        "辰": "土",
        "巳": "火",
        "午": "火",
        "未": "土",
        "申": "金",
        "酉": "金",
        "戌": "土",
        "亥": "水"
      };
      return zhi2wx[zhi] || '';
    };
}

