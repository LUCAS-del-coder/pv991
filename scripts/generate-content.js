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
    throw new Error('Ahrefs API Key 未設置');
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
      throw new Error(`Ahrefs API 失敗: ${response.status}`);
    }

    const data = await response.json();
    const keywords = (data.keywords || [])
      .filter(item => item.keyword_difficulty >= 1)
      .slice(0, limit)
      .map(item => item.keyword);

    console.log(`✅ 獲取了 ${keywords.length} 個關鍵字`);
    return keywords;

  } catch (error) {
    console.error(`❌ Ahrefs 失敗: ${error.message}`);
    throw error;
  }
}

/**
 * 備用關鍵字列表
 */
const FALLBACK_KEYWORDS = [
  'casino myanmar',
  'online casino',
  'slot games',
  'casino app',
  'gambling myanmar'
];

/**
 * 獲取關鍵字
 */
async function getKeywords() {
  if (!AHREFS_API_KEY) {
    console.log('📋 使用備用關鍵字');
    return FALLBACK_KEYWORDS;
  }

  try {
    return await fetchEasyKeywordsFromAhrefs(SEED_KEYWORD, 30);
  } catch (error) {
    console.warn('⚠️  使用備用關鍵字');
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

  const modelList = [
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229'
  ];

  for (const model of modelList) {
    try {
      console.log(`📡 使用模型: ${model}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  模型 ${model} 失敗: ${response.status}`);
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
 * 創建獨立的部落格頁面
 */
function createBlogPost(keyword, aiContent, date) {
  try {
    const content = JSON.parse(aiContent);
    
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
    
    // 生成 Astro 頁面內容
    const astroContent = `---
title: "${escapeQuotes(content.title)}"
description: "${escapeQuotes(content.description)}"
keywords: ["${keyword}", ${content.relatedQuestions?.map(q => `"${escapeQuotes(q)}"`).join(', ') || ''}]
pubDate: ${date}
layout: '../../layouts/BlogPost.astro'
---

<article class="blog-post">
  <h1>${escapeHtml(content.title)}</h1>
  
  <div class="post-meta">
    <time datetime="${date}">${formatDate(date)}</time>
    <span class="keyword-tag">${escapeHtml(keyword)}</span>
  </div>
  
  <div class="post-content">
    ${content.content}
  </div>
  
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
      "name": "PV99"
    }
  }
  </script>
</article>
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
const posts = await Astro.glob('./*.astro');
const sortedPosts = posts
  .filter(post => post.frontmatter.title) // 排除 index.astro 本身
  .sort((a, b) => new Date(b.frontmatter.pubDate) - new Date(a.frontmatter.pubDate));
---

<Layout title="部落格文章 - PV99 線上賭場指南">
  <main class="blog-index">
    <h1>線上賭場指南與文章</h1>
    <p class="intro">探索我們的專業指南，了解更多關於線上賭場的知識</p>
    
    <div class="posts-grid">
      {sortedPosts.map(post => (
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
    
    console.log(`📅 日期: ${date}`);
    console.log(`📌 今日關鍵字: ${selected.join(', ')}`);
    
    // 2. 為主關鍵字生成文章（使用第一個關鍵字）
    const mainKeyword = selected[0];
    const relatedKeywords = selected.slice(1);
    
    console.log(`\n✍️  正在為 "${mainKeyword}" 生成文章...`);
    const aiContent = await generateBlogPost(mainKeyword, relatedKeywords);
    
    // 3. 創建獨立頁面
    const blogPost = createBlogPost(mainKeyword, aiContent, date);
    
    if (blogPost) {
      // 4. 更新索引頁
      updateBlogIndex();
      
      console.log('\n✅ 完成！');
      console.log(`📄 新文章: /blog/${blogPost.slug}`);
      console.log(`🔗 URL: https://your-site.com/blog/${blogPost.slug}`);
      
      process.exit(0);
    } else {
      console.error('\n❌ 文章創建失敗');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 執行失敗:', error.message);
    process.exit(1);
  }
}

main();
