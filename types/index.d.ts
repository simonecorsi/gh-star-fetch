import { Got } from 'got/dist/source';
import { Links, Star, ParsedOutput } from './types';
export declare function getNextPage({ next, last }: Links): string | null;
export declare function compactByLanguage(
  data: any,
  _transform?: typeof transform
): any;
export declare function compactByTopic(
  data: any,
  _transform?: typeof transform
): any;
declare function transform(star: Star): Partial<Star>;
export type Options = {
  accessToken?: string;
  compactByLanguage: boolean;
  compactByTopic: boolean;
  username: string;
  http: Got;
  transform: ((star: Star) => Partial<Star>) | null;
};
export declare function setHttpClient(opts: any): any;
export default function main(options: Partial<Options>): Promise<ParsedOutput>;
export {};
