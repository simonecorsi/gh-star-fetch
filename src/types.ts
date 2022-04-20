import type { Endpoints } from '@octokit/types';

export type ParsedStarsList = Partial<Star>[];

export type CompactByLanguage = {
  [language: string]: ParsedStarsList;
};

export type PaginationLink = {
  uri: string;
  rel: 'next' | 'last' | 'prev' | 'first';
};

export type Stars = Endpoints['GET /user/starred']['response']['data'];
export type Star = Stars[number] & { language: string };

export type ParsedOutput = ParsedStarsList | CompactByLanguage;
