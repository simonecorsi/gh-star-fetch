import { Got } from 'got/dist/source';
import { Links, Star, ParsedOutput } from './types';
export declare function getNextPage({ next, last }: Links): string | null;
declare type Options = {
  accessToken?: string;
  compactByLanguage: boolean;
  username: string;
  http: Got;
  transform: (star: Star) => Partial<Star> | null;
};
export declare function setHttpClient(opts: any): any;
export default function main(options: Partial<Options>): Promise<ParsedOutput>;
export {};
