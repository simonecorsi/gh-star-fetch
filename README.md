# gh-star-fetch

<!-- PROJECT SHIELDS -->

<!-- ![tests](https://github.com/simonecorsi/gh-star-fetch/workflows/test/badge.svg) -->

<!-- toc -->

- [About The Project](#about-the-project)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

<!-- tocstop -->

## About The Project

> Fetch all the starred repositories for a GitHub user

This packages helps in retrieving all the starred repositories for a given github user. This was usefull to me before moving to graphql gh api, I'm leaving this here just for easier usage.

<!-- GETTING STARTED -->

## Installation

```sh
npm i --save gh-star-fetch
# OR
yarn add gh-star-fetch
```

<!-- USAGE EXAMPLES -->

## Usage

```javascript
const results = await ghStarFetch({
  accessToken: '<GITHUB_PERSONAL_ACCESS_TOKEN>',
});
```

## Options

| name                | type                            | default | description                                                                                                                               |
| ------------------- | ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `accessToken`       | `String`                        |         | This is you github [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) |
| `username`          | `String`                        |         | Default to the username of the accessToken, if changed scrapes another user's stars                                                       |
| `compactByLanguage` | `Bool`                          | `false` | Instead of a single array, output will be compacted by languages                                                                          |
| `http`              | `http.Client`                   | `Got`   | This is the HTTP client used to fetch data                                                                                                |
| `transform`         | `(star: Star) => Partial<Star>` |         | You can transform each star object before its pushed to the output array with this callback                                               |

<!-- CONTRIBUTING -->

## Contributing

Project is pretty simple and straight forward for what is my needs, but if you have any idea you're welcome.

This projects uses [commitlint](https://commitlint.js.org/) with Angular configuration so be sure to use standard commit format or PR won't be accepted.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat(scope): some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Simone Corsi - [@im_simonecorsi](https://twitter.com/im_simonecorsi)
