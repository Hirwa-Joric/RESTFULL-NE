module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-constant-condition': 'warn',
    'no-empty': 'warn',
    'no-useless-escape': 'warn',
    semi: ['error', 'always'],
    quotes: ['warn', 'single'],
    indent: ['warn', 2],
  },
};
