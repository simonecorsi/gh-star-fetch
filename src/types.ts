import type { Endpoints } from '@octokit/types';

export type ParsedStarsList = Partial<Star>[];

export type CompactByLanguage = {
  [language: string]: ParsedStarsList;
};

export type CompactByTopic = CompactByLanguage;

export type PaginationLink = {
  url: string;
  rel: 'next' | 'last' | 'prev' | 'first';
  page: string;
  per_page?: string;
  pet?: string;
};

export type Links = Record<'next' | 'last', PaginationLink>;

export type Stars = Endpoints['GET /user/starred']['response']['data'];
export type Star = Stars[number] & { language: string };

export type ParsedOutput = ParsedStarsList | CompactByLanguage;
