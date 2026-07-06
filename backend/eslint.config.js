// backend/eslint.config.js
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      'no-unused-vars': ['warn', { 'args': 'none' }],
    },
  },
  {
    ignores: ['node_modules', 'eslint.config.js'],
  },
];
