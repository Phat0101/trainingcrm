import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-warning-comments': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'prisma/migrations/**', 'scripts/**'],
  },
];

export default eslintConfig;
