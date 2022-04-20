import got from 'got';

if (!process.env.GITHUB_TOKEN && process.env.NODE_ENV !== 'test') {
  throw new Error('[GITHUB_TOKEN] is not set');
}

export default got.extend({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
  prefixUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  responseType: 'json',
});
