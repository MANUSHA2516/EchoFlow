import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const echoPreset = require('@echoflow/config/tailwind');

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [echoPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
