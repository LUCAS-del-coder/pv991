#!/usr/bin/env node

/**
 * SEO 友善版本 - 創建獨立頁面而非堆積在主頁
 * 每天為選中的關鍵字創建獨立的部落格文章
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境變數
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AHREFS_API_KEY = process.env.AHREFS_API_KEY;
const SEED_KEYWORD = process.env.SEED_KEYWORD || 'casino';
const COUNTRY_CODE = process.env.COUNTRY_CODE || 'mm';
const AUTO_DAILY = process.env.AUTO_DAILY === 'true';

// 驗證必要的環境變數
if (!ANTHROPIC_API_KEY) {
  console.error('❌ 錯誤: ANTHROPIC_API_KEY 未設置');
  console.error('請在 GitHub Secrets 中設置 ANTHROPIC_API_KEY');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
  console.error('❌ 錯誤: ANTHROPIC_API_KEY 格式不正確');
  console.error('API Key 應以 sk-ant- 開頭');
  process.exit(1);
}

// 確保 blog 目錄存在
const blogDir = path.join(__dirname, '../src/pages/blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

/**
 * 從 Ahrefs 獲取低難度關鍵字
 */
async function fetchEasyKeywordsFromAhrefs(seedKeyword, limit = 30) {
  if (!AHREFS_API_KEY) {
    console.warn('⚠️  Ahrefs API Key 未設置，將使用備用關鍵字');
    return null;
  }

  try {
    console.log(`📡 正在從 Ahrefs 獲取關鍵字...`);
    
    const response = await fetch('https://api.ahrefs.com/v3/keywords-explorer/keyword-ideas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AHREFS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keywords: [seedKeyword],
        country: COUNTRY_CODE,
        mode: 'terms_match',
        limit: 500,
        order_by: 'keyword_difficulty:asc',
        where: {
          and: [
            { field: 'keyword_difficulty', is: ['gte', 1] },
            { field: 'volume', is: ['gte', 10] }
          ]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️  Ahrefs API 失敗: ${response.status} - ${errorText.substring(0, 200)}`);
      
      // 如果是 404，說明端點不存在，可能是 API 版本或端點路徑已更改
      if (response.status === 404) {
        console.warn(`⚠️  Ahrefs API 端點不存在，可能的原因：`);
        console.warn(`   1. API 版本已更新，端點路徑已更改`);
        console.warn(`   2. API Key 權限不足`);
        console.warn(`   3. 請檢查 Ahrefs API 文檔確認正確的端點`);
        console.warn(`📋 將使用擴展的備用關鍵字列表（${FALLBACK_KEYWORDS.length} 個關鍵字）`);
      }
      
      return null; // 返回 null 而不是 throw，讓系統使用備用關鍵字
    }

    const data = await response.json();
    const keywords = (data.keywords || [])
      .filter(item => item.keyword_difficulty >= 1)
      .slice(0, limit)
      .map(item => item.keyword);

    if (keywords.length === 0) {
      console.warn('⚠️  Ahrefs 未返回關鍵字');
      return null;
    }

    console.log(`✅ 獲取了 ${keywords.length} 個關鍵字`);
    return keywords;

  } catch (error) {
    console.warn(`⚠️  Ahrefs API 錯誤: ${error.message}`);
    console.warn(`📋 將使用擴展的備用關鍵字列表（${FALLBACK_KEYWORDS.length} 個關鍵字）`);
    return null; // 返回 null 而不是 throw，讓系統使用備用關鍵字
  }
}

/**
 * 備用關鍵字列表（用戶提供的30個關鍵字）
 */
const FALLBACK_KEYWORDS = [
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
 * 獲取關鍵字
 */
async function getKeywords() {
  if (!AHREFS_API_KEY) {
    console.log(`📋 使用備用關鍵字（Ahrefs API Key 未設置）`);
    console.log(`📊 備用關鍵字數量: ${FALLBACK_KEYWORDS.length} 個`);
    return FALLBACK_KEYWORDS;
  }

  try {
    const keywords = await fetchEasyKeywordsFromAhrefs(SEED_KEYWORD, 30);
    if (keywords && keywords.length > 0) {
      console.log(`✅ 成功從 Ahrefs 獲取 ${keywords.length} 個關鍵字`);
      return keywords;
    } else {
      console.warn(`⚠️  Ahrefs 未返回關鍵字，使用擴展的備用關鍵字列表`);
      console.log(`📊 備用關鍵字數量: ${FALLBACK_KEYWORDS.length} 個`);
      return FALLBACK_KEYWORDS;
    }
  } catch (error) {
    console.warn(`⚠️  使用擴展的備用關鍵字列表`);
    console.log(`📊 備用關鍵字數量: ${FALLBACK_KEYWORDS.length} 個`);
    return FALLBACK_KEYWORDS;
  }
}

/**
 * 選擇今日關鍵字
 */
function selectKeywordsForToday(allKeywords) {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const startDate = new Date('2025-01-01');
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  
  const groupSize = 5;
  const totalGroups = Math.ceil(allKeywords.length / groupSize);
  const currentGroup = daysSinceStart % totalGroups;
  
  const startIndex = currentGroup * groupSize;
  const endIndex = Math.min(startIndex + groupSize, allKeywords.length);
  const selected = allKeywords.slice(startIndex, endIndex);
  
  return { selected, date: dateString };
}

/**
 * 使用 Claude 生成完整的部落格文章
 */
async function generateBlogPost(keyword, relatedKeywords) {
  const prompt = `請為緬甸線上賭場網站生成一篇完整的 SEO 部落格文章。

主要關鍵字: "${keyword}"
相關關鍵字: ${relatedKeywords.map(k => `"${k}"`).join(', ')}

要求：
1. 標題必須包含主要關鍵字，吸引人且 SEO 友善（50-60 字符）
2. 描述摘要（150-160 字符，包含關鍵字）
3. 完整文章內容（800-1200 字），分為以下段落：
   - 引言（介紹主題，包含主要關鍵字）
   - 主要內容（3-4 個小節，詳細說明）
   - 使用技巧或建議
   - 總結（再次強調主要觀點）
4. 自然融入所有關鍵字（不要堆砌）
5. 使用緬甸語
6. 內容原創、有價值、可讀性強

請以 JSON 格式返回：
{
  "title": "吸引人的標題（包含主關鍵字）",
  "description": "SEO 描述摘要（150-160字符）",
  "content": "完整的 HTML 格式文章內容（使用 <h2>, <h3>, <p>, <ul> 等標籤）",
  "relatedQuestions": [
    "相關問題1",
    "相關問題2",
    "相關問題3"
  ]
}`;

  // 使用可用的 Claude 模型列表（優先使用已驗證可用的模型）
  const modelList = [
    'claude-3-haiku-20240307',  // 已驗證可用
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229'
  ];

  for (const model of modelList) {
    try {
      console.log(`📡 使用模型: ${model}`);
      
      if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY 未設置');
      }

      // 驗證 API Key 格式
      if (!ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
        throw new Error('ANTHROPIC_API_KEY 格式不正確，應以 sk-ant- 開頭');
      }
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  模型 ${model} 失敗: ${response.status} - ${errorText}`);
        if (response.status === 401) {
          throw new Error('API Key 無效或未授權');
        }
        continue;
      }

      const data = await response.json();
      console.log(`✅ 成功使用模型: ${model}`);
      return data.content[0].text;
      
    } catch (error) {
      console.warn(`⚠️  模型 ${model} 錯誤: ${error.message}`);
      continue;
    }
  }

  throw new Error('所有 Claude 模型都失敗');
}

/**
 * 清理和修復 JSON 字符串
 */
function cleanJsonString(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('無效的 JSON 字符串');
  }
  
  // 移除 BOM 和開頭/結尾的空白
  let cleaned = jsonString.trim();
  
  // 移除零寬度字符
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // 嘗試從文本中提取 JSON（如果 AI 返回的是包含 JSON 的文本）
  // 使用非貪婪匹配，找到第一個完整的 JSON 對象
  const jsonMatch = cleaned.match(/\{[\s\S]*?\}(?=\s*(?:\{|\n|$))/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    // 如果沒有找到匹配，嘗試找到最後一個完整的 JSON 對象
    const lastMatch = cleaned.match(/\{[\s\S]*\}/);
    if (lastMatch) {
      cleaned = lastMatch[0];
    }
  }
  
  // 移除 JSON 外的任何文本（markdown 代碼塊標記等）
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  
  return cleaned.trim();
}

/**
 * 安全解析 JSON - 改進版，更好地處理緬甸語和控制字符
 */
function safeJsonParse(jsonString) {
  try {
    // 先清理字符串
    const cleaned = cleanJsonString(jsonString);
    
    // 嘗試直接解析
    return JSON.parse(cleaned);
  } catch (error) {
    // 如果失敗，嘗試更激進的修復
    try {
      let fixed = jsonString.trim();
      
      // 移除 markdown 代碼塊
      fixed = fixed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      
      // 提取 JSON 對象（使用更寬鬆的匹配）
      const jsonMatch = fixed.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到 JSON 對象');
      }
      
      fixed = jsonMatch[0];
      
      // 移除控制字符（但保留換行符，因為它們在 JSON 字符串值中是合法的）
      // 只移除真正的控制字符，不是換行符
      fixed = fixed.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
      
      // 嘗試解析
      const parsed = JSON.parse(fixed);
      console.log('✅ 使用修復後的 JSON 解析成功');
      return parsed;
      
    } catch (secondError) {
      // 最後嘗試：智能修復 JSON 字符串中的未轉義字符
      try {
        let lastAttempt = jsonString.trim();
        
        // 移除 markdown 代碼塊
        lastAttempt = lastAttempt.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        
        // 提取 JSON
        const jsonMatch = lastAttempt.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('未找到 JSON 對象');
        }
        
        lastAttempt = jsonMatch[0];
        
        // 智能修復：在字符串值中轉義特殊字符
        // 使用正則表達式找到所有字符串值並修復它們
        // 匹配 "key": "value" 中的 value 部分
        lastAttempt = lastAttempt.replace(/("(?:[^"\\]|\\.)*")\s*:/g, (match, str) => {
          // 在字符串值內部，轉義未轉義的換行符、回車符和製表符
          // 但不要破壞已經轉義的字符
          return str.replace(/(?<!\\)\n/g, '\\n')
                    .replace(/(?<!\\)\r/g, '\\r')
                    .replace(/(?<!\\)\t/g, '\\t')
                    .replace(/(?<!\\)\f/g, '\\f')
                    .replace(/(?<!\\)\b/g, '\\b')
                    + ':';
        });
        
        // 移除所有控制字符（除了已經轉義的）
        lastAttempt = lastAttempt.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        
        const parsed = JSON.parse(lastAttempt);
        console.log('✅ 使用智能修復方法解析成功');
        return parsed;
      } catch (thirdError) {
        // 最後嘗試：逐字符修復
        try {
          let finalAttempt = jsonString.trim();
          
          // 移除 markdown
          finalAttempt = finalAttempt.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          
          // 提取 JSON
          const jsonMatch = finalAttempt.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('未找到 JSON 對象');
          }
          
          finalAttempt = jsonMatch[0];
          
          // 更激進的方法：在字符串值中轉義所有特殊字符
          // 找到所有 "..." 字符串並修復
          finalAttempt = finalAttempt.replace(/"([^"]*)"/g, (match, content) => {
            // 轉義所有特殊字符
            const escaped = content
              .replace(/\\/g, '\\\\')  // 先轉義反斜杠
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t')
              .replace(/\f/g, '\\f')
              .replace(/\b/g, '\\b')
              .replace(/"/g, '\\"');
            return `"${escaped}"`;
          });
          
          // 但這樣會破壞已經轉義的字符，所以我們需要更聰明的方法
          // 重新嘗試，這次只修復未轉義的字符
          finalAttempt = jsonMatch[0];
          
          // 使用更安全的方法：逐行處理，只在字符串值中修復
          const lines = finalAttempt.split('\n');
          let inString = false;
          let fixedLines = lines.map(line => {
            let result = '';
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inString = !inString;
                result += char;
              } else if (inString && (char === '\n' || char === '\r' || char === '\t')) {
                // 在字符串中，轉義這些字符
                if (char === '\n') result += '\\n';
                else if (char === '\r') result += '\\r';
                else if (char === '\t') result += '\\t';
              } else {
                result += char;
              }
            }
            return result;
          });
          
          finalAttempt = fixedLines.join('\n');
          
          // 移除控制字符
          finalAttempt = finalAttempt.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
          
          const parsed = JSON.parse(finalAttempt);
          console.log('✅ 使用逐字符修復方法解析成功');
          return parsed;
        } catch (fourthError) {
          // 所有方法都失敗了
          console.error('❌ JSON 解析失敗 - 所有修復方法都失敗');
          console.error('第一個錯誤:', error.message);
          console.error('第二個錯誤:', secondError.message);
          console.error('第三個錯誤:', thirdError.message);
          console.error('第四個錯誤:', fourthError.message);
          console.error('原始內容前 1000 字符:');
          console.error(jsonString.substring(0, 1000));
          throw new Error(`JSON 解析失敗: ${fourthError.message}`);
        }
      }
    }
  }
}

/**
 * 創建獨立的部落格頁面
 */
function createBlogPost(keyword, aiContent, date) {
  try {
    const content = safeJsonParse(aiContent);
    
    // 生成 URL 友善的 slug
    const slug = keyword
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
    
    const filename = `${date}-${slug}.astro`;
    const filepath = path.join(blogDir, filename);
    
    // 檢查文件是否已存在（避免重複）
    if (fs.existsSync(filepath)) {
      console.warn(`⚠️  文件已存在: ${filename}`);
      return null;
    }
    
    // 生成 Astro 頁面內容（只包含內容，不包含外層結構，因為布局已經提供了）
    const astroContent = `---
title: "${escapeQuotes(content.title)}"
description: "${escapeQuotes(content.description)}"
keywords: ["${keyword}", ${content.relatedQuestions?.map(q => `"${escapeQuotes(q)}"`).join(', ') || ''}]
pubDate: "${date}"
layout: '../../layouts/BlogPost.astro'
---

${content.content}

${content.relatedQuestions && content.relatedQuestions.length > 0 ? `
<section class="faq-section">
  <h2>常見問題</h2>
  <div class="faq-list">
    ${content.relatedQuestions.map(q => `
      <div class="faq-item">
        <h3>${escapeHtml(q)}</h3>
      </div>
    `).join('')}
  </div>
</section>
` : ''}

<!-- Schema Markup for SEO -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${escapeQuotes(content.title)}",
  "description": "${escapeQuotes(content.description)}",
  "datePublished": "${date}",
  "keywords": "${keyword}",
  "author": {
    "@type": "Organization",
    "name": "PV991"
  }
}
</script>
`;

    fs.writeFileSync(filepath, astroContent, 'utf-8');
    console.log(`✅ 創建部落格文章: ${filename}`);
    
    return {
      filename,
      filepath,
      slug,
      title: content.title,
      description: content.description
    };
    
  } catch (error) {
    console.error('❌ 創建部落格文章失敗:', error.message);
    return null;
  }
}

/**
 * 更新部落格索引頁
 */
function updateBlogIndex() {
  const indexPath = path.join(blogDir, 'index.astro');
  
  const indexContent = `---
import Layout from '../../layouts/Layout.astro';

// 獲取所有部落格文章
const allPosts = await Astro.glob('./*.astro') as any[];
const sortedPosts = allPosts
  .filter((post: any) => post.frontmatter?.title && post.url !== Astro.url.pathname) // 排除 index.astro 本身
  .sort((a: any, b: any) => {
    const dateA = new Date(a.frontmatter.pubDate).getTime();
    const dateB = new Date(b.frontmatter.pubDate).getTime();
    return dateB - dateA;
  });
---

<Layout title="部落格文章 - PV991 線上賭場指南">
  <main class="blog-index">
    <h1>線上賭場指南與文章</h1>
    <p class="intro">探索我們的專業指南，了解更多關於線上賭場的知識</p>
    
    <div class="posts-grid">
      {sortedPosts.map((post: any) => (
        <article class="post-card">
          <h2>
            <a href={post.url}>{post.frontmatter.title}</a>
          </h2>
          <p class="post-meta">
            <time datetime={post.frontmatter.pubDate}>
              {new Date(post.frontmatter.pubDate).toLocaleDateString('zh-TW')}
            </time>
          </p>
          <p class="post-description">{post.frontmatter.description}</p>
          <a href={post.url} class="read-more">閱讀更多 →</a>
        </article>
      ))}
    </div>
  </main>
</Layout>

<style>
  .blog-index {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .post-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: transform 0.2s;
  }
  
  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .post-card h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  
  .post-card h2 a {
    color: #333;
    text-decoration: none;
  }
  
  .post-meta {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .post-description {
    color: #555;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .read-more {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
  }
</style>
`;

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log('✅ 更新部落格索引頁');
}

/**
 * 在主頁添加"最新文章"區塊（可選）
 */
function updateHomePageWithLatestPosts(latestPosts) {
  // 只在主頁顯示最新 3 篇文章的摘要和連結
  // 不是累積所有內容
}

// 輔助函數
function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuotes(text) {
  return String(text || '').replace(/"/g, '\\"');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 SEO 友善部落格生成系統');
  console.log('='.repeat(60));
  
  try {
    // 1. 獲取關鍵字
    const allKeywords = await getKeywords();
    const { selected, date } = selectKeywordsForToday(allKeywords);
    
    console.log(`\n📅 執行日期: ${date}`);
    console.log(`\n📊 關鍵字統計:`);
    console.log(`   - 總關鍵字數: ${allKeywords.length}`);
    console.log(`   - 今日選中: ${selected.length} 個`);
    console.log(`\n📌 今日選中的關鍵字列表:`);
    selected.forEach((keyword, index) => {
      console.log(`   ${index + 1}. ${keyword}`);
    });
    console.log(`\n📋 所有可用關鍵字 (${allKeywords.length} 個):`);
    allKeywords.forEach((keyword, index) => {
      const isSelected = selected.includes(keyword);
      console.log(`   ${index + 1}. ${keyword}${isSelected ? ' ✅ (已選中)' : ''}`);
    });
    
    // 2. 嘗試為每個關鍵字生成文章（直到成功或全部嘗試完）
    let blogPost = null;
    let successKeyword = null;
    const attemptedKeywords = [];
    const failedKeywords = [];
    const existingKeywords = [];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔄 開始生成文章...\n');
    
    for (let i = 0; i < selected.length; i++) {
      const mainKeyword = selected[i];
      const relatedKeywords = selected.filter((_, idx) => idx !== i);
      
      console.log(`\n[${i + 1}/${selected.length}] ✍️  正在處理關鍵字: "${mainKeyword}"`);
      console.log(`   相關關鍵字: ${relatedKeywords.join(', ')}`);
      attemptedKeywords.push(mainKeyword);
      
      try {
        const aiContent = await generateBlogPost(mainKeyword, relatedKeywords);
        
        // 3. 創建獨立頁面
        blogPost = createBlogPost(mainKeyword, aiContent, date);
        
        if (blogPost) {
          successKeyword = mainKeyword;
          console.log(`   ✅ 成功創建文章！`);
          break; // 成功創建，跳出循環
        } else {
          console.log(`   ⚠️  文章已存在，跳過`);
          existingKeywords.push(mainKeyword);
        }
      } catch (error) {
        console.warn(`   ❌ 生成失敗: ${error.message}`);
        failedKeywords.push({ keyword: mainKeyword, error: error.message });
        continue;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 執行結果總結:');
    console.log(`   - 嘗試的關鍵字: ${attemptedKeywords.length} 個`);
    if (successKeyword) {
      console.log(`   - ✅ 成功: ${successKeyword}`);
    }
    if (existingKeywords.length > 0) {
      console.log(`   - ⚠️  已存在: ${existingKeywords.join(', ')}`);
    }
    if (failedKeywords.length > 0) {
      console.log(`   - ❌ 失敗: ${failedKeywords.map(f => f.keyword).join(', ')}`);
    }
    
    if (blogPost) {
      // 4. 更新索引頁
      updateBlogIndex();
      
      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ 完成！');
      console.log(`📄 新文章路徑: /blog/${blogPost.slug}`);
      console.log(`🔗 完整 URL: https://pv991.com/blog/${blogPost.slug}`);
      console.log(`📝 使用的關鍵字: ${successKeyword}`);
      console.log(`📅 發布日期: ${date}`);
      console.log(`\n${'='.repeat(60)}`);
      
      process.exit(0);
    } else {
      // 所有關鍵字都已經有文章了，這是正常情況
      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ 今日所有關鍵字的文章都已存在');
      console.log('ℹ️  沒有新內容需要生成');
      console.log(`\n📌 已檢查的關鍵字: ${attemptedKeywords.join(', ')}`);
      
      // 仍然更新索引頁（以防有新文章）
      updateBlogIndex();
      
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ 執行失敗:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
