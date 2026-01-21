import type { APIRoute } from 'astro';

// 網站配置（與 index.astro 保持一致）
const siteUrl = 'https://pv991.com';

// 動態頁面列表（可以根據需要擴展）
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily', hreflang: true },
  { path: '/guide', priority: '0.8', changefreq: 'weekly', hreflang: true },
  { path: '/blog', priority: '0.7', changefreq: 'weekly', hreflang: false },
  // 第一批新增頁面
  { path: '/about', priority: '0.8', changefreq: 'monthly', hreflang: false },
  { path: '/games/slots', priority: '0.9', changefreq: 'weekly', hreflang: false },
  { path: '/games/live-casino', priority: '0.9', changefreq: 'weekly', hreflang: false },
  { path: '/games/sports-betting', priority: '0.9', changefreq: 'daily', hreflang: false },
  { path: '/promotions', priority: '0.8', changefreq: 'weekly', hreflang: false },
  { path: '/payment-methods', priority: '0.7', changefreq: 'monthly', hreflang: false },
  { path: '/responsible-gaming', priority: '0.6', changefreq: 'monthly', hreflang: false },
  { path: '/faq', priority: '0.7', changefreq: 'monthly', hreflang: false },
  { path: '/contact', priority: '0.6', changefreq: 'monthly', hreflang: false }
];

// 已知的部落格文章列表（動態生成時會自動包含）
const knownBlogPosts = [
  '2026-01-08-casino-myanmar',
  '2026-01-09-casino-app',
  '2026-01-09-casino-myanmar',
  '2026-01-09-gambling-myanmar',
  '2026-01-09-online-casino',
  '2026-01-09-slot-games',
  '2026-01-10-casino-myanmar',
  '2026-01-10-slot-games',
  '2026-01-11-casino-app',
  '2026-01-11-casino-myanmar',
  '2026-01-12-online-casino',
  '2026-01-12-slot-games',
  '2026-01-13-casino-myanmar',
  '2026-01-13-casino-platform',
  '2026-01-13-slot-games'
];

// 動態生成 lastmod 日期（每次請求時都是當前日期）
const getLastMod = () => new Date().toISOString().split('T')[0];

// 渲染單個 URL 條目（包含 hreflang）
const renderUrlEntry = (path: string, priority: string, changefreq: string, hreflang: boolean = false, lastmod?: string) => {
  const modDate = lastmod || getLastMod();
  const hreflangTags = hreflang ? `
    <xhtml:link rel="alternate" hreflang="my-MM" href="${siteUrl}${path}" />
    <xhtml:link rel="alternate" hreflang="my" href="${siteUrl}${path}" />` : '';
  
  return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflangTags}
  </url>`;
};

// 動態生成 sitemap
export const GET: APIRoute = async () => {
  // 生成所有部落格文章的 URL
  const blogUrls = knownBlogPosts
    .map((slug) => {
      const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
      const lastmod = dateMatch ? dateMatch[1] : getLastMod();
      return renderUrlEntry(`/blog/${slug}`, '0.6', 'monthly', false, lastmod);
    })
    .join('\n');

  // 動態生成所有 URL 條目
  const staticUrls = staticPages
    .map((page) => renderUrlEntry(page.path, page.priority, page.changefreq, page.hreflang))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${blogUrls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
};

