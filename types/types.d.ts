import type { Endpoints } from '@octokit/types';
export declare type ParsedStarsList = Partial<Star>[];
export declare type CompactByLanguage = {
  [language: string]: ParsedStarsList;
};
export declare type PaginationLink = {
  uri: string;
  rel: 'next' | 'last' | 'prev' | 'first';
};
export declare type Stars = Endpoints['GET /user/starred']['response']['data'];
export declare type Star = Stars[number] & {
  language: string;
};
export declare type ParsedOutput = ParsedStarsList | CompactByLanguage;
