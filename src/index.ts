// original content by: https://github.com/TriPSs/conventional-changelog-action/blob/master/src/helpers/git.js

import link from './link';

import type {
  CompactByLanguage,
  PaginationLink,
  Stars,
  Star,
  ApiGetStarResponse,
} from './types';
import client from './client';

export function wait(time = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
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
): AsyncGenerator<Stars> {
  let nextPage: string | null = '1';
  while (nextPage) {
    try {
      const { headers, body } = await client.get(url, {
        searchParams: {
          page: nextPage,
        },
      });
      yield body as unknown as Stars;
      if (process.env.NODE_ENV === 'test') break;
      nextPage = getNextPage(link.parse(headers.link).refs);
      await wait(opts.wait || 100); // avoid limits
    } catch (e) {
      console.error(e);
      break;
    }
  }
}

async function apiGetStar(
  url: string,
  opts: Options
): Promise<ApiGetStarResponse> {
  const data: Partial<Star>[] = [];
  for await (const stars of paginateStars(url, opts)) {
    for (const star of stars) {
      data.push({
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
      } as Partial<Star>);
    }
  }
  return data as unknown as Stars;
}

type Options = {
  wait: number;
  compactByLanguage: boolean;
  username: string;
};

const DEFAULT_OPTIONS: Options = {
  wait: 1000,
  compactByLanguage: false,
  username: process.env.GITHUB_USERNAME,
};

export default async function main(
  options: Partial<Options> = {}
): Promise<Stars | CompactByLanguage> {
  const opts: Options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  if (!opts.username) {
    throw new Error('[opts.username] is not set');
  }

  const API_STARRED_URL = `users/${opts.username}/starred`;

  const results: Stars = await apiGetStar(API_STARRED_URL, opts);

  if (opts.compactByLanguage) {
    const sorted = results.reduce((acc: CompactByLanguage, val: Star) => {
      const language = val.language || 'miscellaneous';
      if (!acc[language]) {
        acc[language] = [val];
      } else {
        acc[language].push(val);
      }
      return acc;
    }, {});
    return sorted;
  }

  return results;
}
