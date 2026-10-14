import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  // Rewrites :hover/:focus rules so a story can show those states without a pointer or focus.
  addons: ['storybook-addon-pseudo-states'],
};

export default config;
