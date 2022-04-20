process.env.NODE_ENV = 'test';

import tap from 'tap';
import main, { getNextPage } from '../src';
import { PaginationLink } from '../src/types';
import packageJson from '../package.json';

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
  let url = packageJson.repository.url.split('/');
  url.pop();
  const username = url.pop();
  const results = await main({ username });
  console.log('results :>> ', results);
});
