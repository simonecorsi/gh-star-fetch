import type { Endpoints } from '@octokit/types';
export declare type ParsedStarsList = Partial<Star>[];
export declare type CompactByLanguage = {
  [language: string]: ParsedStarsList;
};
export declare type PaginationLink = {
  url: string;
  rel: 'next' | 'last' | 'prev' | 'first';
  page: string;
  per_page?: string;
  pet?: string;
};
export declare type Links = Record<'next' | 'last', PaginationLink>;
export declare type Stars = Endpoints['GET /user/starred']['response']['data'];
export declare type Star = Stars[number] & {
  language: string;
};
export declare type ParsedOutput = ParsedStarsList | CompactByLanguage;
