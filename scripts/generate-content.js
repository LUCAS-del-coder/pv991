#!/usr/bin/env node

/**
 * 自動生成 Online Casino SEO 內容腳本
 * 使用 Anthropic Claude API 生成 SEO 優化的文案
 */

const fs = require('fs');
const path = require('path');

// 讀取環境變數
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CONTENT_TYPE = process.env.CONTENT_TYPE || 'all';

if (!ANTHROPIC_API_KEY) {
  console.error('❌ 錯誤: 未設置 ANTHROPIC_API_KEY 環境變數');
  console.error('請在 GitHub Secrets 中設置 ANTHROPIC_API_KEY');
  process.exit(1);
}

// 讀取 index.astro 文件
const indexPath = path.join(__dirname, '../src/pages/index.astro');
let indexContent = fs.readFileSync(indexPath, 'utf-8');

/**
 * 使用 Anthropic API 生成 SEO 內容
 */
async function generateSEOContent(contentType) {
  const messages = {
    all: `請為一個緬甸語的線上賭場網站生成 SEO 優化的文案。網站名稱是 PV99，提供多個線上賭場平台（Yes8, Ygn9, Pya777, Mmk99, Kbz999, Mmk123, Mmk8）和熱門遊戲（Rich Mahjong, Super Ace, Fortune Gems, Sweet Bonanza 等）。

請生成以下內容（使用緬甸語）：
1. 主標題和描述段落（約 150-200 字）
2. 線上賭場遊戲介紹段落（約 100-150 字）
3. 安全支付方式介紹段落（約 100-150 字）

要求：
- 自然流暢的緬甸語
- 包含關鍵字：線上賭場、PV99、Yes8、Ygn9、Pya777、Mmk99、slot games、online casino
- SEO 優化，但保持可讀性
- 突出安全、可靠、多樣化遊戲選擇等優勢

請以 JSON 格式返回：
{
  "mainTitle": "主標題",
  "mainParagraph": "主段落內容",
  "gamesTitle": "遊戲標題",
  "gamesParagraph": "遊戲段落內容",
  "paymentTitle": "支付標題",
  "paymentParagraph": "支付段落內容"
}`,
    
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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 錯誤: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('❌ API 調用失敗:', error.message);
    throw error;
  }
}

/**
 * 解析 AI 返回的內容並更新文件
 */
function updateIndexFile(aiContent, contentType) {
  try {
    console.log('📝 開始解析 AI 內容...');
    console.log('AI 返回內容長度:', aiContent.length);
    
    // 嘗試解析 JSON（如果是 all 類型）
    let content;
    if (contentType === 'all') {
      try {
        // 提取 JSON 部分（可能包含在 markdown 代碼塊中）
        let jsonText = aiContent;
        
        // 移除 markdown 代碼塊標記
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // 嘗試找到 JSON 對象
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[0]);
          console.log('✅ 成功解析 JSON 格式');
        } else {
          throw new Error('無法找到 JSON 格式');
        }
      } catch (e) {
        console.warn('⚠️  無法解析 JSON，嘗試提取結構化內容');
        // 嘗試從文本中提取結構化內容
        content = {
          mainTitle: extractSection(aiContent, '主標題', '標題'),
          mainParagraph: extractSection(aiContent, '主段落', '描述'),
          gamesTitle: extractSection(aiContent, '遊戲標題', '遊戲'),
          gamesParagraph: extractSection(aiContent, '遊戲段落', '遊戲內容'),
          paymentTitle: extractSection(aiContent, '支付標題', '支付'),
          paymentParagraph: extractSection(aiContent, '支付段落', '支付內容')
        };
      }
    } else {
      content = { raw: aiContent };
    }

    // 更新 SEO 內容區域
    if (contentType === 'all') {
      // 更新主標題
      const titleRegex = /(<h2 id="about-title">)[^<]*(<\/h2>)/;
      if (titleRegex.test(indexContent) && content.mainTitle) {
        indexContent = indexContent.replace(
          titleRegex,
          `$1${content.mainTitle}$2`
        );
        console.log('✅ 已更新主標題');
      }

      // 更新主段落（匹配多行段落）
      const mainParaRegex = /(<p>\s*)(PV99[^<]*(?:\s*Yes8[^<]*)?)(<\/p>)/;
      if (mainParaRegex.test(indexContent) && content.mainParagraph) {
        indexContent = indexContent.replace(
          mainParaRegex,
          `$1${content.mainParagraph}$3`
        );
        console.log('✅ 已更新主段落');
      }

      // 更新遊戲段落
      const gamesSectionRegex = /(<h3>)[^<]*(<\/h3>\s*<p>)([^<]+)(<\/p>)/;
      const gamesMatch = indexContent.match(gamesSectionRegex);
      if (gamesMatch && content.gamesTitle && content.gamesParagraph) {
        indexContent = indexContent.replace(
          gamesSectionRegex,
          `$1${content.gamesTitle}$2${content.gamesParagraph}$4`
        );
        console.log('✅ 已更新遊戲段落');
      }

      // 更新支付段落
      const paymentSectionRegex = /(<h3>လုံခြုံစိတ်ချရသော[^<]*<\/h3>\s*<p>)([^<]+)(<\/p>)/;
      if (paymentSectionRegex.test(indexContent) && content.paymentTitle && content.paymentParagraph) {
        indexContent = indexContent.replace(
          paymentSectionRegex,
          `$1${content.paymentParagraph}$3`
        );
        console.log('✅ 已更新支付段落');
      }
    } else {
      // 對於其他類型，在 SEO 內容區域末尾添加新內容
      const seoSectionEnd = indexContent.indexOf('</section>', indexContent.indexOf('seo-content'));
      if (seoSectionEnd !== -1) {
        const newContent = `\n        <div class="auto-generated-content">\n          <p>${content.raw}</p>\n        </div>\n        `;
        indexContent = indexContent.slice(0, seoSectionEnd) + newContent + indexContent.slice(seoSectionEnd);
        console.log('✅ 已添加新內容');
      }
    }

    // 寫回文件
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    console.log('✅ SEO 內容已更新到文件');
    
    return true;
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
 * 主函數
 */
async function main() {
  console.log(`🚀 開始生成 ${CONTENT_TYPE} 類型的 SEO 內容...`);
  
  try {
    // 生成內容
    const aiContent = await generateSEOContent(CONTENT_TYPE);
    console.log('✅ AI 內容生成成功');
    
    // 更新文件
    const updated = updateIndexFile(aiContent, CONTENT_TYPE);
    
    if (updated) {
      console.log('✅ 內容更新完成');
      process.exit(0);
    } else {
      console.error('❌ 內容更新失敗');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 執行失敗:', error.message);
    process.exit(1);
  }
}

// 執行主函數
main();

