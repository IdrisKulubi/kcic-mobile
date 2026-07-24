import { apiFetch } from '@/lib/api-client';
import { API_BASE_URL } from '@/lib/auth-client';

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  thumbnail: string;
  category: string;
  slug: string;
  readTime: string | null;
  featured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgrammeSponsor = {
  id: string;
  programmeId: string;
  name: string;
  logo: string;
  order: number;
};

export type Programme = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  headerImage: string | null;
  color: string;
  order: number;
  isActive: boolean;
  category: string;
  applicationLink: string | null;
  introduction: string | null;
  applicationProcess: string | null;
  criteria: string | null;
  eligibility: string | null;
  applicationSelection: string | null;
  technicalSupport: string | null;
  definitions: string | null;
  terms: string | null;
  scoringSystem: string | null;
  fraudPolicy: string | null;
  sponsors?: ProgrammeSponsor[];
};

export type OpportunityAttachment = {
  id: string;
  opportunityId: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  order: number;
};

export type Opportunity = {
  id: string;
  title: string;
  slug: string;
  type: string;
  referenceNumber: string | null;
  summary: string;
  description: string | null;
  department: string | null;
  location: string | null;
  workMode: string | null;
  employmentType: string | null;
  requirements: string | null;
  qualifications: string | null;
  responsibilities: string | null;
  applicationEmail: string | null;
  applicationLink: string | null;
  applicationInstructions: string | null;
  deadline: string | null;
  issuedDate: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: OpportunityAttachment[];
};

type ListResponse<T> = { items: T[]; nextCursor: string | null };
type DetailResponse<T> = { item: T };

export function fetchNews(query = '') {
  return apiFetch<ListResponse<NewsArticle>>(`/api/content/news?limit=100${query}`);
}

export function fetchProgrammes(query = '') {
  return apiFetch<ListResponse<Programme>>(`/api/content/programmes?limit=100${query}`);
}

export function fetchOpportunities(query = '') {
  return apiFetch<ListResponse<Opportunity>>(`/api/content/opportunities?limit=100${query}`);
}

export function fetchContentDetail(
  type: 'article' | 'programme' | 'opportunity',
  slugOrId: string
) {
  const resource =
    type === 'article' ? 'news' : type === 'programme' ? 'programmes' : 'opportunities';
  return apiFetch<DetailResponse<NewsArticle | Programme | Opportunity>>(
    `/api/content/${resource}/${encodeURIComponent(slugOrId)}`
  );
}

export function formatContentDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function resolveContentImageUrl(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return `${API_BASE_URL}${trimmed}`;
    return trimmed;
  }
  return undefined;
}

export function getProgrammeImage(programme: Pick<Programme, 'headerImage' | 'image'>) {
  return resolveContentImageUrl(programme.headerImage, programme.image);
}
