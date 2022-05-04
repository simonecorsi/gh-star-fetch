process.env.NODE_ENV = 'test';

import tap from 'tap';
import main, { getNextPage, wait } from '../src';
import { PaginationLink } from '../src/types';
import packageJson from '../package.json';
import mockResponse from './fixture.json';
import client from '../src/client';
import ResponseLike from 'responselike';

tap.test('wait', async (t) => {
  await wait(10);
});

tap.test('Should throw without [GITHUB_USERNAME]', async (t) => {
  await t.rejects(main, Error, '[GITHUB_USERNAME] is not set');
});

// uri: string;
//   rel: 'next' | 'last' | 'prev' | 'first';
tap.test('Should get next page from parsed links', (t) => {
  t.test('should be null if no links', (t) => {
    t.equal(getNextPage([]), null);
    t.end();
  });

  t.test('should be null if cant parse next page number', (t) => {
    t.equal(
      getNextPage([
        { uri: 'next', rel: 'next' },
        { uri: 'last', rel: 'last' },
      ]),
      null
    );
    t.end();
  });

  t.test(
    'should be null if nextPage is currentPage, we are done paginating',
    (t) => {
      t.equal(
        getNextPage([
          { uri: 'http://invalid.ajeje/?page=1', rel: 'next' },
          { uri: 'http://invalid.ajeje/?page=1', rel: 'last' },
        ]),
        null
      );
      t.end();
    }
  );

  t.test('should return next page url', (t) => {
    const links: PaginationLink[] = [
      { uri: 'http://invalid.ajeje/?page=1', rel: 'last' },
      { uri: 'http://invalid.ajeje/?page=2', rel: 'next' },
    ];
    const uri = links[1].uri;
    t.equal(getNextPage(links), uri.charAt(uri.length - 1));
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
            {},
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
            {},
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
            {},
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