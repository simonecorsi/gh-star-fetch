import got, { ExtendOptions } from 'got';

const options = {
  headers: {},
  prefixUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  responseType: 'json',
  hooks: {},
};

/* istanbul ignore next */
if (!process.env.GITHUB_TOKEN && process.env.NODE_ENV !== 'test') {
  throw new Error('[GITHUB_TOKEN] is not set');
}

/* istanbul ignore next */
if (process.env.GITHUB_TOKEN) {
  options.headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  };
}

export default got.extend(options as ExtendOptions);
