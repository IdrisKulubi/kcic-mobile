import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { formatContentDate, type NewsArticle } from '@/lib/content-api';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeArticleHtml(html: string | null) {
  if (!html) return '';
  return html
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}

export function buildArticlePrintHtml(article: NewsArticle) {
  const published = formatContentDate(article.publishedAt);
  const readTime = article.readTime ?? 'Article';
  const meta = [article.category, published, readTime].filter(Boolean).join(' · ');
  const bodyHtml = sanitizeArticleHtml(article.content);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(article.title)}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
        color: #3f4042;
        margin: 40px;
        line-height: 1.6;
      }
      .brand {
        color: #80c738;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 18px;
      }
      h1 {
        font-size: 28px;
        line-height: 1.2;
        margin: 0 0 12px;
        color: #3f4042;
      }
      .meta {
        color: #65676a;
        font-size: 13px;
        margin-bottom: 24px;
      }
      .excerpt {
        font-size: 16px;
        color: #65676a;
        margin-bottom: 24px;
      }
      .content p { margin: 0 0 14px; }
      .content h2, .content h3 { margin: 24px 0 10px; }
      .content ul, .content ol { margin: 0 0 14px 20px; }
    </style>
  </head>
  <body>
    <div class="brand">KCIC Climate Hub</div>
    <h1>${escapeHtml(article.title)}</h1>
    <div class="meta">${escapeHtml(meta)}</div>
    <p class="excerpt">${escapeHtml(article.excerpt)}</p>
    <div class="content">${bodyHtml || `<p>${escapeHtml(article.excerpt)}</p>`}</div>
  </body>
</html>`;
}

export async function printArticle(article: NewsArticle) {
  if (Platform.OS === 'web') {
    throw new Error('Printing is not supported on web.');
  }
  await Print.printAsync({ html: buildArticlePrintHtml(article) });
}

export async function downloadArticlePdf(article: NewsArticle) {
  if (Platform.OS === 'web') {
    throw new Error('PDF download is not supported on web.');
  }

  const { uri } = await Print.printToFileAsync({
    html: buildArticlePrintHtml(article),
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: article.title,
    UTI: 'com.adobe.pdf',
  });
}
