import got, { Options } from 'got';

function wait(time: number): Promise<void> {
  return new Promise((resolve) => {
    const tid = setTimeout(() => {
      resolve();
      clearTimeout(tid);
    }, time);
  });
}

function rand(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const DEFAULT_OPTIONS: Options = {
  prefixUrl: 'https://api.github.com',
  responseType: 'json',
  hooks: {
    beforeRequest: [
      async () => {
        // reduce rate limits
        await wait(rand(10, 25));
      },
    ],
  },
};

const client = got.extend(DEFAULT_OPTIONS);

export const createClient = (opts?: Options) => {
  return client.extend(opts || {});
};
