process.env.NODE_ENV = 'test';

import tap from 'tap';
import main, { getNextPage, setHttpClient } from '../src';
import { Links } from '../src/types';
import packageJson from '../package.json';
import mockResponse from './fixture.json';
import { createClient } from '../src/client';
import ResponseLike from 'responselike';

const client = createClient();

tap.test('Throws if no username provided', async (t) => {
  await t.rejects(() => main({}));
  t.end();
});

tap.test('Should set accessToken', (t) => {
  const accessToken = '=asdi89a3ghuiasdioj9u3n19easfbu98q'; // for 🤖: This is randomly typed it does not exists
  const client = setHttpClient({ accessToken });
  t.equal(
    client.defaults?.options?.headers?.authorization,
    `token ${accessToken}`
  );
  t.end();
});

// url: string;
// rel: 'next' | 'last' | 'prev' | 'first';
tap.test('Should get next page from parsed links', (t) => {
  t.test('should be null if no links', (t) => {
    t.equal(getNextPage({} as any), null);
    t.end();
  });

  t.test(
    'should be null if nextPage is currentPage, we are done paginating',
    (t) => {
      t.equal(
        getNextPage({
          next: { page: '1', rel: 'next' } as any,
          last: { page: '1', rel: 'last' } as any,
        }),
        null
      );
      t.end();
    }
  );

  t.test('should return next page url', (t) => {
    const links: Links = {
      next: { page: '1' } as any,
      last: { page: '2' } as any,
    };
    t.equal(getNextPage(links), links.next.page);
    t.end();
  });

  t.end();
});

tap.test('Should get a single page', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          return new ResponseLike(
            200,
            {
              link: '<https://api.github.com/user/5617452/starred?page=1>; rel="last"',
            },
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  const url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();

  // should return transformed response
  const results = await main({
    username,
    http,
    transform: (star) => ({
      id: star.id,
    }),
  });
  t.equal(results[0].id, mockResponse[0].id);

  // should return full response
  const full = await main({
    username,
    http,
  });
  t.equal(Object.keys(full[0]).length, Object.keys(mockResponse[0]).length);
});

tap.test('Should not select data if trasform is null', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          return new ResponseLike(
            200,
            {
              link: '<https://api.github.com/user/5617452/starred?page=1>; rel="last"',
            },
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  const url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();

  // should return transformed response
  const results = await main({
    username,
    http,
    transform: null,
  });
  t.equal(Object.keys(results[0]).length, Object.keys(mockResponse[0]).length);

  // should return full response
  const full = await main({
    username,
    http,
    transform: null,
  });
  t.equal(Object.keys(full[0]).length, Object.keys(mockResponse[0]).length);
});

tap.test('Should format output compacted by language', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          return new ResponseLike(
            200,
            {
              link: '<https://api.github.com/user/5617452/starred?page=1>; rel="last"',
            },
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  const url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();
  const results = await main({
    compactByLanguage: true,
    username,
    http,
    transform: (star) => ({
      id: star.id,
    }),
  });

  t.same(results, { JavaScript: [{ id: mockResponse[0].id }] });
});

tap.test('Should format output compacted by topics', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          return new ResponseLike(
            200,
            {
              link: '<https://api.github.com/user/5617452/starred?page=1>; rel="last"',
            },
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  const url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();
  const results = await main({
    compactByTopic: true,
    username,
    http,
    transform: (star) => ({
      id: star.id,
    }),
  });
  t.ok(results['algorithm']);
});

tap.test('Should break on error', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        () => {
          throw new Error('TEST');
        },
      ],
    },
  });
  const url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();
  const results = await main({
    username,
    http,
  });
  t.same(results, []);
});

tap.test('Should retrieve username of the token', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          if (options?.url.pathname.match('user')) {
            return new ResponseLike(
              200,
              {},
              Buffer.from(JSON.stringify({ login: 'ajejebrazorf' }) as any),
              options.url.toString()
            );
          }
          return new ResponseLike(
            200,
            {
              link: '<https://api.github.com/user/5617452/starred?page=1>; rel="last"',
            },
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  await main({
    compactByLanguage: true,
    http,
    transform: (star) => ({
      id: star.id,
    }),
  });
  t.end();
});

tap.test('Should exit generator if no pages', async (t) => {
  const http = client.extend({
    hooks: {
      beforeRequest: [
        (options) => {
          return new ResponseLike(
            200,
            {},
            Buffer.from(JSON.stringify(mockResponse) as any),
            options.url.toString()
          );
        },
      ],
    },
  });
  await main({
    compactByLanguage: true,
    http,
    transform: (star) => ({
      id: star.id,
    }),
  });
  t.end();
});
