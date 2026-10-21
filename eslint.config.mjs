import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Same rules as the old .eslintrc.json ("next/core-web-vitals" + "next/typescript"),
// in ESLint's flat-config format. Next.js 16 removed `next lint`, so `pnpm lint`
// runs ESLint directly.
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', '.open-next/**', '.wrangler/**', 'node_modules/**', 'next-env.d.ts'],
  },
];

export default config;
