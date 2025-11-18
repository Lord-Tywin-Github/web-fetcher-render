// app/api/fetch-web/route.ts
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// ======================== 超强清理黑名单（实测最狠） ========================
const REMOVE_SELECTORS = [
  'script', 'style', 'noscript', 'svg', 'canvas',
  'header', 'footer', 'nav', 'aside', 'form',
  '.ad', '.ads', '.advert', '.banner', '.cookie', '.popup', '.modal',
  '[class*="ad"]', '[class*="cookie"]', '[class*="popup"]', '[id*="ad"]',
  'iframe', 'meta', 'link[  as="style"]', 'link[rel="preload"]',
  'noscript', 'template', 'symbol', 'use'
];

// ======================== 主要内容提取优先级（智能提取正文） ========================
const MAIN_CONTENT_SELECTORS = [
  'article',
  'main',
  '[role="main"]',
  '#content', '.content',
  '.post', '.entry', '.article',
  '.markdown-body', '.readme',
  'div[class*="content"]', 'div[id*="content"]'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: true, content: "## ❌ 缺少 URL 参数" },
      { status: 400 }
    );
  }

  // 强制加上 https:// 如果没有协议
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    // 伪装成真实浏览器
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    );

    // 关键：等待页面真正渲染完成（尤其是 SPA）
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // 额外等待 + 滚动触发懒加载图片/内容
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const html = await page.content();
    const $ = cheerio.load(html, { decodeEntities: true });

    const baseUrl = new URL(url);

    // ======================== 1. 暴力移除干扰元素 ========================
    REMOVE_SELECTORS.forEach(sel => $(sel).remove());

    // ======================== 2. 智能提取主要内容 ========================
    let $main = $('body');
    for (const selector of MAIN_CONTENT_SELECTORS) {
      const candidate = $(selector).first();
      if (candidate.length && candidate.text().trim().length > 200) {
        $main = candidate;
        break;
      }
    }

    // ======================== 3. 递归深度清理（核心） ========================
    function deepClean(node: cheerio.Element) {
      const $node = $(node);

      // 移除所有危险属性
      $node.removeAttr('style');
      Object.keys($node.attr() || {}).forEach(attr => {
        if (
          attr.startsWith('on') ||
          attr === 'srcdoc' ||
          $node.attr(attr)?.includes('javascript:') ||
          $node.attr(attr)?.startsWith('data:')
        ) {
          $node.removeAttr(attr);
        }
      });

      // 处理 a 标签
      if (node.tagName === 'a') {
        const href = $node.attr('href') || '';
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          try {
            const absolute = new URL(href, baseUrl).href;
            $node.attr('href', absolute);
          } catch {
            $node.removeAttr('href');
          }
        }
      }

      // 处理 img 标签
      if (node.tagName === 'img') {
        const src = $node.attr('src') || '';
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          try {
            const absolute = new URL(src, baseUrl).href;
            $node.attr('src', absolute);
          } catch {
            $node.remove();
            return;
          }
        }
        $node.removeAttr('srcset loading decoding');
        $node.attr('loading', 'lazy');
      }

      // 处理 CSS 中的 url()
      const style = $node.attr('style');
      if (style) {
        const cleaned = style.replace(/url\(['"]?([^'"]+)['"]?\)/g, (match, p1) => {
          if (p1.startsWith('http') || p1.startsWith('data:')) return match;
          try {
            return `url('${new URL(p1, baseUrl).href}')`;
          } catch {
            return 'url()';
          }
        });
        $node.attr('style', cleaned);
      }

      // 递归子节点
      $node.children().each((_, child) => deepClean(child));
    }

    $main.children().each((_, el) => deepClean(el));

    // ======================== 4. 生成终极安全的 HTML ========================
    const bodyHtml = $main.html() || '<p>内容为空或已被反爬机制屏蔽。</p>';

    const finalHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8">
  <title>${$('title').text() || '网页内容'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* 终极隔离 CSS —— 任何网站都翻不了天 */
    html, body { 
      margin:0 !important; padding:20px !important; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      line-height: 1.6 !important; color: #1f2937 !important;
      background: white !important;
    }
    * { 
      all: unset !important; 
      box-sizing: border-box !important; 
      max-width: 100% !important; 
      word-wrap: break-word !important;
      display: block !important;
    }
    div, article, section, main, p, li, h1,h2,h3,h4,h5,h6 { display: block !important; }
    a { color: #0066cc !important; text-decoration: underline !important; cursor: pointer; }
    img { max-width: 100% !important; height: auto !important; display: block !important; border-radius: 8px; }
    table, tr, td, th { 
      display: table !important; width: 100% !important; 
      border-collapse: collapse; border: 1px solid #e5e7eb !important;
      padding: 8px !important;
    }
    pre, code { 
      background: #f3f4f6 !important; padding: 12px !important; 
      border-radius: 8px !important; overflow-x: auto !important;
      white-space: pre-wrap !important;
    }
    blockquote { border-left: 4px solid #ddd !important; padding-left: 16px !important; margin: 16px 0 !important; }
  </style>
</head>
<body>
  ${bodyHtml}
  <!-- Powered by xAI Grok Web Fetcher -->
</body>
</html>`;

    return NextResponse.json({ content: finalHtml, url });

  } catch (error: any) {
    console.error('Puppeteer 抓取失败:', error);

    const markdownError = `## ❌ 网页加载失败

**URL:** \`${url}\`

**错误:** ${error.message || '未知错误'}

**可能原因：**
- 目标网站启用强反爬（Cloudflare、Akamai、DDoS 保护）
- 服务器网络被限制出站访问
- Puppeteer 在当前环境启动失败（Vercel/Netlify 不支持）

**建议：**
- 尝试一个简单网站测试（如 http://example.com）
- 或部署到支持无头浏览器的服务器（Railway、Fly.io、AWS EC2 等）`;

    return NextResponse.json(
      { error: true, content: markdownError },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
