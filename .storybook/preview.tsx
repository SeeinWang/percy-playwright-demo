import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: { layout: 'fullscreen' },
  // Centre each story the way body centres the card on the real page.
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
