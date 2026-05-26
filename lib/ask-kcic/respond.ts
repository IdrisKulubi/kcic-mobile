import type { KnowledgeChunk, KnowledgeLinkType } from '@/lib/ask-kcic/knowledge';
import { retrieveChunks } from '@/lib/ask-kcic/knowledge';

export type AskCitation = {
  type: KnowledgeLinkType;
  id: string;
  title: string;
  subtitle: string;
};

export type AskReply = {
  content: string;
  citations: AskCitation[];
};

const SUGGESTED_PROMPTS = [
  'What grants are open for waste startups?',
  'Upcoming events for AgTech founders',
  'Explain carbon tax for manufacturers',
  'SME stories in renewable energy',
];

export function getSuggestedPrompts() {
  return SUGGESTED_PROMPTS;
}

function detectIntent(query: string) {
  const q = query.toLowerCase();
  if (/grant|fund|apply|financ|opportunit/.test(q)) return 'grant' as const;
  if (/event|webinar|expo|register|attend|calendar/.test(q)) return 'event' as const;
  if (/podcast|episode|listen|watch/.test(q)) return 'podcast' as const;
  if (/story|founder|sme|startup/.test(q)) return 'story' as const;
  if (/policy|tax|regulation|carbon|compliance/.test(q)) return 'policy' as const;
  if (/solar|agri|farm|irrigation/.test(q)) return 'agtech' as const;
  if (/energy|renewable|grid/.test(q)) return 'energy' as const;
  return 'general' as const;
}

function citationFromChunk(chunk: KnowledgeChunk): AskCitation {
  return {
    type: chunk.type,
    id: chunk.id,
    title: chunk.title,
    subtitle: chunk.subtitle,
  };
}

function personalizeLine(interests: string[]) {
  if (interests.length === 0) return '';
  const focus = interests.slice(0, 2).join(' and ');
  return `\n\nBased on your interests (${focus}), I've prioritized the most relevant KCIC resources below.`;
}

function buildGrantAnswer(chunks: KnowledgeChunk[], interests: string[]) {
  const grant = chunks.find((c) => c.type === 'grant');
  const related = chunks.filter((c) => c.type !== 'grant').slice(0, 2);

  const lines = [
    grant
      ? `The **${grant.title}** is currently highlighted in KCIC Climate Hub: ${grant.summary}`
      : 'KCIC tracks several funding pathways for climate ventures.',
    '',
    '**Recommended next steps:**',
    '1. Review eligibility and prepare a short impact narrative.',
    '2. Register interest before the deadline.',
    related.length
      ? `3. Read related intelligence: ${related.map((c) => c.title).join(' and ')}.`
      : '3. Explore related insights in the Library and Insights tabs.',
  ];

  return {
    content: lines.join('\n') + personalizeLine(interests),
    citations: [grant, ...related].filter(Boolean).map((c) => citationFromChunk(c!)),
  };
}

function buildEventAnswer(chunks: KnowledgeChunk[], interests: string[]) {
  const events = chunks.filter((c) => c.type === 'event');
  const lines = [
    'Here are upcoming KCIC ecosystem events that match your question:',
    '',
    ...events.map((e, i) => `${i + 1}. **${e.title}** — ${e.subtitle}. ${e.summary}`),
    '',
    'Tap a source below to view details or mark yourself as interested from the Library tab.',
  ];

  return {
    content: lines.join('\n') + personalizeLine(interests),
    citations: events.map(citationFromChunk),
  };
}

function buildGeneralAnswer(chunks: KnowledgeChunk[], query: string, interests: string[]) {
  const intent = detectIntent(query);

  if (intent === 'grant' && chunks.some((c) => c.type === 'grant')) {
    return buildGrantAnswer(chunks, interests);
  }
  if (intent === 'event' && chunks.some((c) => c.type === 'event')) {
    return buildEventAnswer(chunks, interests);
  }

  const lines = [
    "Here's what KCIC's climate intelligence library suggests:",
    '',
    ...chunks.map((c, i) => {
      const label =
        c.type === 'article'
          ? 'Insight'
          : c.type === 'story'
            ? 'SME Story'
            : c.type === 'event'
              ? 'Event'
              : c.type === 'podcast'
                ? 'Podcast'
                : 'Opportunity';
      return `${i + 1}. **${c.title}** (${label}) — ${c.summary}`;
    }),
    '',
    'Open any source below for the full detail screen.',
  ];

  return {
    content: lines.join('\n') + personalizeLine(interests),
    citations: chunks.map(citationFromChunk),
  };
}

function buildFallback(query: string) {
  return {
    content: [
      "I couldn't find a strong match in the current KCIC prototype library for that question.",
      '',
      'Try asking about grants, upcoming events, policy briefs, SME stories, or podcasts. You can also browse Insights and Library.',
      '',
      `Your question: "${query.trim()}"`,
    ].join('\n'),
    citations: [] as AskCitation[],
  };
}

export function askKcic(query: string, interests: string[]): AskReply {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      content: 'Ask me anything about KCIC reports, grants, events, SME stories, or podcasts.',
      citations: [],
    };
  }

  const chunks = retrieveChunks(trimmed, interests, 4);
  if (chunks.length === 0) return buildFallback(trimmed);

  const intent = detectIntent(trimmed);
  if (intent === 'grant') return buildGrantAnswer(chunks, interests);
  if (intent === 'event') return buildEventAnswer(chunks, interests);

  return buildGeneralAnswer(chunks, trimmed, interests);
}

export const WELCOME_MESSAGE: AskReply = {
  content: [
    "Hi, I'm **Ask KCIC** — your climate intelligence assistant for this prototype.",
    '',
    'I search KCIC reports, SME stories, events, podcasts, and funding callouts to give you quick, cited answers.',
    '',
    'Try one of the suggested questions below, or ask your own.',
  ].join('\n'),
  citations: [],
};
