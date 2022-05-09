/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

let isCi = false;

try {
  isCi = require('is-ci');
} catch (_) {
  isCi = true;
}

if (!isCi) {
  require('husky').install();
}
