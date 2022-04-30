import link from './link';
import { createClient } from './client';
import { Got } from 'got/dist/source';
import { CompactByLanguage, PaginationLink, Star, ParsedOutput } from './types';

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

type paginateStarsOpts = Pick<Options, 'http' | 'accessToken'>;
async function* paginateStars(
  url: string,
  opts: paginateStarsOpts
): AsyncGenerator<Star> {
  let nextPage: string | null = '1';
  while (nextPage) {
    try {
      const { headers, body } = await opts.http.get(url, {
        searchParams: {
          per_page: 100,
          page: nextPage,
        },
      });
      for (const record of body) {
        yield record as unknown as Star;
      }
      nextPage = getNextPage(link.parse(headers.link).refs);

      if (!opts.accessToken) {
        console.warn(
          'No github access token provided, limiting call to first page to avoid rate limit ban'
        );
        break;
      }
    } catch (e) {
      console.error('[http-error]:', e?.response?.body || e);
      break;
    }
  }
}

async function apiGetStar(opts: Options): Promise<ParsedOutput> {
  const data: Star[] = [];
  const API_STARRED_URL = `users/${opts.username}/starred`;
  for await (const star of paginateStars(API_STARRED_URL, opts)) {
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
  accessToken?: string;
  compactByLanguage: boolean;
  username: string;
  http: Got;
  transform: (star: Star) => Partial<Star> | null;
};

const DEFAULT_OPTIONS = {
  accessToken: process.env.GITHUB_TOKEN,
  username: process.env.GITHUB_USERNAME,
  compactByLanguage: false,
  transform,
};

export function setHttpClient(opts) {
  // http is provided in opts in test cases env
  if (opts.http) return opts.http;

  const headers = {};
  if (opts.accessToken) {
    (headers as any).Authorization = `token ${opts.accessToken}`;
  }
  return createClient({ headers });
}

export default async function main(
  options: Partial<Options>
): Promise<ParsedOutput> {
  if (!options.username) {
    throw new Error('[options.username] is not set');
  }

  const opts = Object.assign({}, DEFAULT_OPTIONS, options, {
    http: setHttpClient(options),
  }) as Options;

  return apiGetStar(opts);
}
