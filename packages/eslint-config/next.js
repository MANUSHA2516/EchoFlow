/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@echoflow/eslint-config', 'next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'off',
  },
};
