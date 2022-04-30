import { Got } from 'got/dist/source';
import { PaginationLink, Star, ParsedOutput } from './types';
export declare function wait(time?: number): Promise<void>;
export declare function getNextPage(links: PaginationLink[]): string | null;
declare type Options = {
  wait: number;
  compactByLanguage: boolean;
  username: string;
  http: Got;
  transform: (star: Star) => Partial<Star> | null;
};
export default function main(options?: Partial<Options>): Promise<ParsedOutput>;
export {};
