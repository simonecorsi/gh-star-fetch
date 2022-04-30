import link from './link';
import client from './client';
import { Got } from 'got/dist/source';

import { CompactByLanguage, PaginationLink, Star, ParsedOutput } from './types';

export function wait(time: number): Promise<void> {
  return new Promise((resolve) => {
    const tid = setTimeout(() => {
      resolve();
      clearTimeout(tid);
    }, time);
  });
}

export function getNextPage(links: PaginationLink[]): string | null {
  const next = links.find((l) => l.rel === 'next');
  const last = links.find((l) => l.rel === 'last');
  if (!next || !last) return null;
  const matchNext = next.uri.match(/page=([0-9]*)/);
  const matchLast = last.uri.match(/page=([0-9]*)/);
  if (!matchNext || !matchLast) return null;
  if (matchNext[1] === matchLast[1]) return null;
  return matchNext[1];
}

async function* paginateStars(
  url: string,
  opts: Options
): AsyncGenerator<Star> {
  let nextPage: string | null = '1';
  while (nextPage) {
    try {
      const { headers, body } = await opts.http.get(url, {
        searchParams: {
          page: nextPage,
        },
      });
      for (const record of body) {
        yield record as unknown as Star;
      }
      nextPage = getNextPage(link.parse(headers.link).refs);
      await wait(opts.wait); // avoid limits
    } catch (e) {
      console.error('[http-error]:', e?.response?.body || e);
      break;
    }
  }
}

async function apiGetStar(url: string, opts: Options): Promise<ParsedOutput> {
  const data: Star[] = [];
  for await (const star of paginateStars(url, opts)) {
    data.push(star);
  }

  if (!opts.compactByLanguage) {
    if (typeof opts.transform !== 'function') return data;
    return data.map((star) => opts.transform(star));
  }

  const sorted = data.reduce((acc: CompactByLanguage, val: Star) => {
    const language = val.language || 'miscellaneous';
    const parsed =
      typeof opts.transform !== 'function' ? val : opts.transform(val);

    if (!acc[language]) {
      acc[language] = [parsed];
    } else {
      acc[language].push(parsed);
    }
    return acc;
  }, {});
  return sorted;
}

function transform(star: Star): Partial<Star> {
  return {
    id: star.id,
    node_id: star.node_id,
    name: star.name,
    full_name: star.full_name,
    owner: {
      login: star?.owner?.login,
      id: star?.owner?.id,
      avatar_url: star?.owner?.avatar_url,
      url: star?.owner?.url,
      html_url: star?.owner?.html_url,
    },
    html_url: star.html_url,
    description: star.description,
    url: star.url,
    languages_url: star.languages_url,
    created_at: star.created_at,
    updated_at: star.updated_at,
    git_url: star.git_url,
    ssh_url: star.ssh_url,
    clone_url: star.clone_url,
    homepage: star.homepage,
    stargazers_count: star.stargazers_count,
    watchers_count: star.watchers_count,
    language: star.language,
    topics: star.topics,
  } as Partial<Star>;
}

type Options = {
  wait: number;
  compactByLanguage: boolean;
  username: string;
  http: Got;
  transform: (star: Star) => Partial<Star> | null;
};

const DEFAULT_OPTIONS: Options = {
  wait: 1000,
  compactByLanguage: false,
  username: process.env.GITHUB_USERNAME,
  http: client,
  transform,
};

export default async function main(
  options: Partial<Options> = {}
): Promise<ParsedOutput> {
  const opts: Options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  if (!opts.username) {
    throw new Error('[opts.username] is not set');
  }

  const API_STARRED_URL = `users/${opts.username}/starred`;

  return apiGetStar(API_STARRED_URL, opts);
}
