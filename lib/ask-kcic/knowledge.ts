import { articles, events, podcasts, stories } from '@/data/kcic';

export type KnowledgeLinkType = 'article' | 'story' | 'event' | 'podcast' | 'grant';

export type KnowledgeChunk = {
  id: string;
  type: KnowledgeLinkType;
  title: string;
  subtitle: string;
  summary: string;
  keywords: string[];
  text: string;
};

const grantChunk: KnowledgeChunk = {
  id: 'green-innovation-grant',
  type: 'grant',
  title: 'Green Innovation Grant',
  subtitle: 'Funding · Closes in 5 days',
  summary:
    'Up to $50,000 in equity-free funding for early-stage waste management startups working on circular economy solutions in Kenya.',
  keywords: [
    'grant',
    'funding',
    'apply',
    'waste',
    'circular',
    'startup',
    'equity-free',
    'innovation',
    'opportunity',
  ],
  text: 'Green Innovation Grant funding waste management circular economy Kenya equity-free 50000 apply',
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function buildKnowledgeBase(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [grantChunk];

  articles.forEach((a) => {
    chunks.push({
      id: a.id,
      type: 'article',
      title: a.title,
      subtitle: `${a.category} · ${a.readTime}`,
      summary: a.summary,
      keywords: tokenize(`${a.title} ${a.category} ${a.summary}`),
      text: `${a.title} ${a.category} ${a.summary} ${a.date}`.toLowerCase(),
    });
  });

  stories.forEach((s) => {
    chunks.push({
      id: s.id,
      type: 'story',
      title: s.title,
      subtitle: `${s.sector} · ${s.location}`,
      summary: s.summary,
      keywords: tokenize(`${s.title} ${s.sector} ${s.founder} ${s.impact} ${s.summary}`),
      text: `${s.title} ${s.sector} ${s.founder} ${s.location} ${s.impact} ${s.summary}`.toLowerCase(),
    });
  });

  events.forEach((e) => {
    chunks.push({
      id: e.id,
      type: 'event',
      title: e.title,
      subtitle: `${e.date} · ${e.location}`,
      summary: `${e.type} on ${e.date} at ${e.time}. ${e.location}.`,
      keywords: tokenize(`${e.title} ${e.type} ${e.location} event webinar expo`),
      text: `${e.title} ${e.type} ${e.date} ${e.time} ${e.location}`.toLowerCase(),
    });
  });

  podcasts.forEach((p) => {
    chunks.push({
      id: p.id,
      type: 'podcast',
      title: p.title,
      subtitle: p.publishedLabel,
      summary: p.summary,
      keywords: tokenize(`${p.title} ${p.summary} podcast episode`),
      text: `${p.title} ${p.summary} ${p.publishedLabel}`.toLowerCase(),
    });
  });

  return chunks;
}

export const KNOWLEDGE_BASE = buildKnowledgeBase();

export function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[], interests: string[]) {
  let score = 0;
  const interestText = interests.join(' ').toLowerCase();

  queryTokens.forEach((token) => {
    if (chunk.text.includes(token)) score += 4;
    if (chunk.keywords.some((k) => k.includes(token) || token.includes(k))) score += 3;
    if (chunk.title.toLowerCase().includes(token)) score += 5;
  });

  if (interestText) {
    chunk.keywords.forEach((k) => {
      if (interestText.includes(k) || k.includes('agri') && interestText.includes('agtech')) score += 1;
      if (k.includes('energy') && interestText.includes('renewable')) score += 1;
      if (k.includes('waste') && interestText.includes('circular')) score += 1;
      if (k.includes('financ') && interestText.includes('finance')) score += 1;
    });
  }

  return score;
}

export function retrieveChunks(query: string, interests: string[], limit = 4) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return KNOWLEDGE_BASE.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, queryTokens, interests),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.chunk);
}
