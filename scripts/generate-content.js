#!/usr/bin/env node

/**
 * 自動生成 Online Casino SEO 內容腳本
 * 使用 Anthropic Claude API 生成 SEO 優化的文案
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 獲取當前文件目錄（ES 模組中 __dirname 的替代方案）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SEO 關鍵字列表（29個）
const KEYWORDS = [
  'shwe shan casino',
  'lion boss casino',
  'fishing casino - ငါးမုဆိုးတို့',
  'shwe casino apk download old version',
  'mwd777 myanmar online casino',
  'shwe casino login',
  'shwe casino game app',
  'jdbyg best online casino in myanmar',
  'shwe casino 2014',
  'shwe casino game download ios',
  'shwe casino 2014 apk',
  'mighty fu casino - slots game downloadable content',
  'shwe casino app link',
  'gkk777 best online casino in myanmar',
  'shwe casino game',
  'www.shwe casino app',
  'shwe casino game download',
  'online casino myanmar',
  'shwe casino download',
  'golden7 casino',
  'mighty fu casino - slots game',
  'casino myanmar',
  'mighty fu casino slots game',
  'shwe casino app update',
  'shwe casino apk download',
  'shwe casino apk',
  'fortune casino myanmar',
  'shwe casino',
  'shwe casino 2014 download'
];

/**
 * 根據日期選擇 5 個關鍵字（確保每天選擇相同）
 */
function selectKeywordsForToday() {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 使用日期作為種子，確保每天選擇相同的關鍵字
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed += dateString.charCodeAt(i);
  }
  
  // 簡單的偽隨機數生成器
  const random = (seed) => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  const selected = [];
  const available = [...KEYWORDS];
  let currentSeed = seed;
  
  // 選擇 5 個關鍵字
  for (let i = 0; i < 5 && available.length > 0; i++) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const index = Math.floor(random(currentSeed) * available.length);
    selected.push(available.splice(index, 1)[0]);
  }
  
  return { selected, date: dateString };
}

// 讀取環境變數
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CONTENT_TYPE = process.env.CONTENT_TYPE || 'all';
const AUTO_DAILY = process.env.AUTO_DAILY === 'true';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ 錯誤: 未設置 ANTHROPIC_API_KEY 環境變數');
  console.error('請在 GitHub Secrets 中設置 ANTHROPIC_API_KEY');
  process.exit(1);
}

// 驗證 API Key 格式（Anthropic API Key 通常以 sk-ant- 開頭）
if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
  console.warn('⚠️  警告: API Key 格式可能不正確（應以 sk-ant- 開頭）');
  console.warn('請確認 API Key 是否正確設置');
}

// 讀取文件路徑
const indexPath = path.join(__dirname, '../src/pages/index.astro');
const guidePath = path.join(__dirname, '../src/pages/guide.astro');

// 檢查文件是否存在
if (!fs.existsSync(indexPath)) {
  console.error(`❌ 錯誤: 找不到文件 ${indexPath}`);
  process.exit(1);
}

if (!fs.existsSync(guidePath)) {
  console.error(`❌ 錯誤: 找不到文件 ${guidePath}`);
  process.exit(1);
}

let indexContent = fs.readFileSync(indexPath, 'utf-8');
let guideContent = fs.readFileSync(guidePath, 'utf-8');

/**
 * 使用 Anthropic API 生成 SEO 內容
 */
async function generateSEOContent(contentType, keywords = null) {
  // 如果是每日自動更新，使用選中的關鍵字
  let keywordText = '';
  let keywordRequirement = '';
  if (keywords && keywords.length > 0) {
    keywordText = `\n\n【重要】以下 ${keywords.length} 個關鍵字必須全部融入內容中：\n${keywords.map((k, i) => `${i + 1}. "${k}"`).join('\n')}\n\n`;
    keywordRequirement = `\n\n【關鍵字使用要求 - 必須嚴格遵守】：
1. 上述 ${keywords.length} 個關鍵字必須全部在內容中出現，每個關鍵字至少出現一次
2. 關鍵字可以完整出現（如 "shwe casino"）或部分出現（如 "shwe casino app" 中包含 "shwe casino"）
3. 關鍵字必須自然地融入句子中，不要生硬堆砌
4. 主標題必須包含至少 1-2 個關鍵字
5. 主段落必須包含至少 3-4 個關鍵字
6. 遊戲段落必須包含至少 1-2 個相關關鍵字
7. 如果關鍵字包含 "casino myanmar"、"online casino myanmar" 等，必須在適當位置使用
8. 如果關鍵字包含 "shwe casino"、"lion boss casino"、"fishing casino" 等，必須在描述中提及
9. 如果關鍵字包含 "mwd777"、"gkk777"、"jdbyg" 等平台名稱，可以與 PV99 的平台列表一起提及
10. 生成完成後，請檢查是否所有關鍵字都已包含，如果缺少任何關鍵字，必須重新生成`;
  }
  
  const messages = {
    all: `請為一個緬甸語的線上賭場網站生成 SEO 優化的文案。網站名稱是 PV99，提供多個線上賭場平台（Yes8, Ygn9, Pya777, Mmk99, Kbz999, Mmk123, Mmk8）和熱門遊戲（Rich Mahjong, Super Ace, Fortune Gems, Sweet Bonanza 等）。${keywordText}

請生成以下內容（使用緬甸語）：
1. 主標題和描述段落（約 200-300 字）
2. 線上賭場遊戲介紹段落（約 150-200 字）
3. 安全支付方式介紹段落（約 150-200 字）

基本要求：
- 自然流暢的緬甸語
- 必須包含基礎關鍵字：線上賭場、PV99、Yes8、Ygn9、Pya777、Mmk99、slot games、online casino${keywordRequirement}
- SEO 優化，但保持可讀性
- 突出安全、可靠、多樣化遊戲選擇等優勢

請以 JSON 格式返回：
{
  "mainTitle": "主標題（必須包含至少 1-2 個指定關鍵字）",
  "mainParagraph": "主段落內容（必須包含至少 3-4 個指定關鍵字，總共約 200-300 字）",
  "gamesTitle": "遊戲標題（可以包含相關關鍵字）",
  "gamesParagraph": "遊戲段落內容（必須包含至少 1-2 個相關關鍵字，約 150-200 字）",
  "paymentTitle": "支付標題",
  "paymentParagraph": "支付段落內容（約 150-200 字）",
  "faqQuestion": "一個與線上賭場相關的常見問題（使用緬甸語，約 20-30 字）",
  "faqAnswer": "該問題的詳細答案（使用緬甸語，約 100-150 字，必須自然融入至少 1-2 個指定關鍵字）"
}

【最後檢查】返回 JSON 前，請確認所有 ${keywords ? keywords.length : 0} 個指定關鍵字都已包含在內容中。`,
    
    seo: `請為線上賭場網站生成 SEO 優化的文案。重點關注：
- 線上賭場的優勢和特色
- 遊戲多樣性和品質
- 安全性和可靠性
- 支付方式的便利性

使用緬甸語，約 500-800 字，包含相關關鍵字。`,
    
    games: `請生成關於線上賭場遊戲的 SEO 文案，介紹：
- 熱門 slot 遊戲（Rich Mahjong, Super Ace, Fortune Gems, Sweet Bonanza 等）
- 遊戲提供商（Pragmatic Play, GameArt, Jili 等）
- 遊戲特色和獎金倍數

使用緬甸語，約 300-500 字。`,
    
    promotions: `請生成關於線上賭場促銷活動的 SEO 文案，包括：
- 新會員優惠
- 每日獎金
- 特別活動

使用緬甸語，約 200-400 字。`
  };

  const prompt = messages[contentType] || messages.all;

  // 嘗試的模型列表（按優先順序）
  // 根據 Anthropic 官方文檔，正確的模型名稱格式
  const modelList = [
    'claude-3-5-sonnet-20240620',  // Claude 3.5 Sonnet (最新)
    'claude-3-opus-20240229',      // Claude 3 Opus
    'claude-3-sonnet-20240229',    // Claude 3 Sonnet
    'claude-3-haiku-20240307'      // Claude 3 Haiku (最快最便宜)
  ];

  let lastError = null;

  for (const model of modelList) {
    try {
      console.log(`📡 嘗試使用模型: ${model}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      console.log(`📊 API 響應狀態: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  模型 ${model} 失敗: ${response.status} - ${errorText}`);
        lastError = new Error(`API 錯誤: ${response.status} - ${errorText}`);
        continue; // 嘗試下一個模型
      }

      const data = await response.json();
      console.log(`✅ 成功使用模型: ${model}`);
      return data.content[0].text;
    } catch (error) {
      console.warn(`⚠️  模型 ${model} 調用異常: ${error.message}`);
      lastError = error;
      continue; // 嘗試下一個模型
    }
  }

  // 所有模型都失敗
  console.error('❌ 所有模型都無法使用');
  throw lastError || new Error('無法連接到 Anthropic API');
}

/**
 * 解析 AI 返回的內容並更新文件
 */
function updateFiles(aiContent, contentType) {
  try {
    console.log('📝 開始解析 AI 內容...');
    console.log('AI 返回內容長度:', aiContent.length);
    
    // 嘗試解析 JSON（如果是 all 類型）
    let content;
    if (contentType === 'all') {
      try {
        // 提取 JSON 部分（可能包含在 markdown 代碼塊中）
        let jsonText = aiContent;
        
        // 移除 markdown 代碼塊標記和可能的說明文字
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // 移除可能的開頭說明文字
        jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        
        // 嘗試找到 JSON 對象（更寬鬆的匹配）
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            content = JSON.parse(jsonMatch[0]);
            console.log('✅ 成功解析 JSON 格式');
          } catch (parseError) {
            console.warn('⚠️  JSON 解析失敗，嘗試修復格式');
            // 嘗試修復常見的 JSON 格式問題
            let fixedJson = jsonMatch[0];
            // 修復缺少引號的鍵名
            fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
            // 修復缺少引號的值（如果值不包含特殊字符）
            fixedJson = fixedJson.replace(/:\s*([^",{\[}\]]+?)(\s*[,}])/g, (match, value, suffix) => {
              const trimmed = value.trim();
              if (trimmed && !trimmed.startsWith('"') && !trimmed.match(/^[\d.]+$/)) {
                return `: "${trimmed}"${suffix}`;
              }
              return match;
            });
            
            try {
              content = JSON.parse(fixedJson);
              console.log('✅ 修復後成功解析 JSON');
            } catch (e2) {
              throw new Error('無法修復 JSON 格式');
            }
          }
        } else {
          throw new Error('無法找到 JSON 格式');
        }
      } catch (e) {
        console.warn('⚠️  無法解析 JSON，嘗試從文本中提取內容');
        console.warn('錯誤詳情:', e.message);
        
        // 嘗試從 JSON 文本中直接提取字段（即使格式不完全正確）
        const extractJsonField = (text, fieldName) => {
          const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]+)"`, 'i');
          const match = text.match(regex);
          return match ? match[1] : null;
        };
        
        content = {
          mainTitle: extractJsonField(aiContent, 'mainTitle') || extractSection(aiContent, 'mainTitle', '主標題', '標題'),
          mainParagraph: extractJsonField(aiContent, 'mainParagraph') || extractSection(aiContent, 'mainParagraph', '主段落', '描述'),
          gamesTitle: extractJsonField(aiContent, 'gamesTitle') || extractSection(aiContent, 'gamesTitle', '遊戲標題', '遊戲'),
          gamesParagraph: extractJsonField(aiContent, 'gamesParagraph') || extractSection(aiContent, 'gamesParagraph', '遊戲段落', '遊戲內容'),
          paymentTitle: extractJsonField(aiContent, 'paymentTitle') || extractSection(aiContent, 'paymentTitle', '支付標題', '支付'),
          paymentParagraph: extractJsonField(aiContent, 'paymentParagraph') || extractSection(aiContent, 'paymentParagraph', '支付段落', '支付內容'),
          faqQuestion: extractJsonField(aiContent, 'faqQuestion') || null,
          faqAnswer: extractJsonField(aiContent, 'faqAnswer') || null
        };
        
        // 如果至少有一些內容，就繼續
        if (!content.mainTitle && !content.mainParagraph) {
          console.warn('⚠️  無法提取任何結構化內容，將使用原始內容');
          content = { raw: aiContent };
        } else {
          console.log('✅ 從文本中提取了部分結構化內容');
        }
      }
    } else {
      content = { raw: aiContent };
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let updated = false;
    
    // 1. 更新 guide 分頁的 SEO 內容
    if (contentType === 'all' && (content.mainTitle || content.mainParagraph)) {
      const guideSeoSectionEnd = guideContent.indexOf('</section>', guideContent.indexOf('seo-content'));
      
      if (guideSeoSectionEnd !== -1) {
        const guideNewContent = `
        
        <!-- AI 自動生成內容 - ${timestamp} -->
        <div class="auto-generated-seo-content">
          ${content.mainTitle ? `<h3>${escapeHtml(content.mainTitle)}</h3>` : ''}
          ${content.mainParagraph ? `<p>${escapeHtml(content.mainParagraph)}</p>` : ''}
          ${content.gamesTitle ? `<h4>${escapeHtml(content.gamesTitle)}</h4>` : ''}
          ${content.gamesParagraph ? `<p>${escapeHtml(content.gamesParagraph)}</p>` : ''}
          ${content.paymentTitle ? `<h4>${escapeHtml(content.paymentTitle)}</h4>` : ''}
          ${content.paymentParagraph ? `<p>${escapeHtml(content.paymentParagraph)}</p>` : ''}
        </div>
        `;
        
        guideContent = guideContent.slice(0, guideSeoSectionEnd) + guideNewContent + '\n      ' + guideContent.slice(guideSeoSectionEnd);
        fs.writeFileSync(guidePath, guideContent, 'utf-8');
        console.log('✅ SEO 內容已更新到 guide 分頁');
        updated = true;
      } else {
        console.warn('⚠️  無法找到 guide 分頁的 SEO 內容區域');
      }
    }
    
    // 2. 在主頁添加 FAQ（如果有）
    if (contentType === 'all' && content.faqQuestion && content.faqAnswer) {
      const faqContainerEnd = indexContent.indexOf('</div>', indexContent.indexOf('faq-container'));
      
      if (faqContainerEnd !== -1) {
        const faqNewContent = `
          <!-- AI 自動生成 FAQ - ${timestamp} -->
          <div class="faq-item">
            <div class="faq-question">${escapeHtml(content.faqQuestion)}</div>
            <div class="faq-answer">${escapeHtml(content.faqAnswer)}</div>
            <div class="faq-date">更新日期: ${timestamp}</div>
          </div>
        `;
        
        indexContent = indexContent.slice(0, faqContainerEnd) + faqNewContent + '\n        ' + indexContent.slice(faqContainerEnd);
        fs.writeFileSync(indexPath, indexContent, 'utf-8');
        console.log('✅ FAQ 已添加到主頁');
        updated = true;
      } else {
        console.warn('⚠️  無法找到 FAQ 容器區域');
      }
    } else if (contentType !== 'all') {
      // 對於其他類型，使用原始邏輯（保持向後兼容）
      const seoSectionEnd = indexContent.indexOf('</section>', indexContent.indexOf('seo-content'));
      
      if (seoSectionEnd !== -1) {
        let safeContent = content.raw || aiContent;
        if (safeContent.trim().startsWith('{') && safeContent.trim().endsWith('}')) {
          const textMatches = safeContent.match(/"([^"]{20,})"/g);
          if (textMatches && textMatches.length > 0) {
            safeContent = textMatches.map(m => m.slice(1, -1)).join('\n\n');
          } else {
            return false;
          }
        }
        
        const newContent = `
        
        <!-- AI 自動生成內容 - ${timestamp} -->
        <div class="auto-generated-seo-content">
          <p>${escapeHtml(safeContent)}</p>
        </div>
        `;
        
        indexContent = indexContent.slice(0, seoSectionEnd) + newContent + '\n        ' + indexContent.slice(seoSectionEnd);
        fs.writeFileSync(indexPath, indexContent, 'utf-8');
        console.log('✅ 已新增 SEO 內容');
        updated = true;
      }
    }
    
    return updated;
  } catch (error) {
    console.error('❌ 更新文件失敗:', error.message);
    console.error(error.stack);
    return false;
  }
}

/**
 * 從文本中提取特定部分的內容
 */
function extractSection(text, ...keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:：]?\\s*([^\\n]+(?:\\n[^\\n]+)*)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * 轉義 HTML 特殊字符
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 驗證生成的內容是否包含所有關鍵字
 */
function validateKeywords(content, keywords) {
  if (!keywords || keywords.length === 0) {
    return { valid: true, missing: [] };
  }
  
  const allText = JSON.stringify(content).toLowerCase();
  const missing = [];
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    // 檢查完整關鍵字或部分匹配（例如 "shwe casino" 可以在 "shwe casino app" 中找到）
    const keywordParts = keywordLower.split(/\s+/);
    let found = false;
    
    // 先檢查完整關鍵字
    if (allText.includes(keywordLower)) {
      found = true;
    } else {
      // 檢查關鍵字的主要部分（至少包含 2/3 的詞）
      const requiredParts = Math.ceil(keywordParts.length * 0.6);
      let matchedParts = 0;
      for (const part of keywordParts) {
        if (part.length > 2 && allText.includes(part)) {
          matchedParts++;
        }
      }
      if (matchedParts >= requiredParts) {
        found = true;
      }
    }
    
    if (!found) {
      missing.push(keyword);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing: missing,
    found: keywords.length - missing.length,
    total: keywords.length
  };
}

/**
 * 主函數
 */
async function main() {
  console.log(`🚀 開始生成 ${CONTENT_TYPE} 類型的 SEO 內容...`);
  console.log(`📁 目標文件: ${indexPath}`);
  console.log(`🔑 API Key 已設置: ${ANTHROPIC_API_KEY ? '是' : '否'}`);
  console.log(`📅 每日自動更新: ${AUTO_DAILY ? '是' : '否'}`);
  
  // 如果是每日自動更新，選擇關鍵字
  let selectedKeywords = null;
  if (AUTO_DAILY) {
    const keywordSelection = selectKeywordsForToday();
    selectedKeywords = keywordSelection.selected;
    console.log(`📌 今日選中的關鍵字 (${keywordSelection.date}):`);
    selectedKeywords.forEach((kw, i) => console.log(`   ${i + 1}. ${kw}`));
  }
  
  try {
    // 生成內容
    console.log('📡 正在調用 Anthropic API...');
    const aiContent = await generateSEOContent(CONTENT_TYPE, selectedKeywords);
    console.log('✅ AI 內容生成成功');
    console.log(`📝 生成內容長度: ${aiContent.length} 字符`);
    
    // 驗證關鍵字（如果有的話）
    if (selectedKeywords && selectedKeywords.length > 0) {
      console.log('🔍 驗證關鍵字使用情況...');
      // 先解析內容以驗證
      try {
        let jsonText = aiContent;
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          const validation = validateKeywords(parsedContent, selectedKeywords);
          
          if (validation.valid) {
            console.log(`✅ 關鍵字驗證通過：所有 ${validation.total} 個關鍵字都已包含`);
          } else {
            console.warn(`⚠️  關鍵字驗證警告：`);
            console.warn(`   - 已包含：${validation.found}/${validation.total} 個關鍵字`);
            console.warn(`   - 缺少的關鍵字：${validation.missing.join(', ')}`);
            console.warn(`   - 內容仍會更新，但建議檢查關鍵字使用情況`);
          }
        }
      } catch (e) {
        console.warn('⚠️  無法驗證關鍵字（內容格式可能不是 JSON）');
      }
    }
    
    // 更新文件
    console.log('📝 正在更新文件...');
    const updated = updateFiles(aiContent, CONTENT_TYPE);
    
    if (updated) {
      console.log('✅ 內容更新完成');
      if (selectedKeywords) {
        console.log(`📌 選中的關鍵字: ${selectedKeywords.join(', ')}`);
      }
      process.exit(0);
    } else {
      console.error('❌ 內容更新失敗');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 執行失敗:', error.message);
    console.error('錯誤堆疊:', error.stack);
    process.exit(1);
  }
}

// 執行主函數
main();

