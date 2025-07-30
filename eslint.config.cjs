const { node } = require('globals')
const { configs } = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')
const tsParser = require('@typescript-eslint/parser')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
  allConfig: configs.all,
})

module.exports = [
  {
    ignores: ['dist/', 'prisma/', 'node_modules/', 'eslint.config.cjs', 'prettier.config.cjs'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    languageOptions: {
      globals: {
        ...node,
      },
      parser: tsParser,
      sourceType: 'commonjs',
      ecmaVersion: 'latest',
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    rules: {
      'semi': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
