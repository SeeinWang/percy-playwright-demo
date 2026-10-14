import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from '../App';

// Each story is one Percy snapshot. States are set directly in markup,
// instead of being clicked into as the Playwright tests do.

const meta: Meta = { title: 'Signup' };
export default meta;
type Story = StoryObj;

export const Card: Story = { render: () => <App /> };

const buttons = () => (
  <div className="card">
    <div className="actions">
      <button id="primary" type="button" className="btn btn-primary">Subscribe</button>
      <button id="secondary" type="button" className="btn btn-secondary">Maybe later</button>
    </div>
  </div>
);

const emailField = () => (
  <div className="card">
    <label htmlFor="email">Email</label>
    <input id="email" type="email" placeholder="you@example.com" />
  </div>
);

export const Buttons: Story = { render: buttons };

// Interaction states, forced by storybook-addon-pseudo-states. Each selector limits
// the state to one element; `true` would apply it to everything in the story.
export const PrimaryHover: Story = { render: buttons, parameters: { pseudo: { hover: ['#primary'] } } };
export const SecondaryHover: Story = { render: buttons, parameters: { pseudo: { hover: ['#secondary'] } } };
export const PrimaryFocus: Story = { render: buttons, parameters: { pseudo: { focus: ['#primary'] } } };
export const EmailFocus: Story = { render: emailField, parameters: { pseudo: { focus: ['#email'] } } };

export const EmailError: Story = {
  render: () => (
    <div className="card">
      <label htmlFor="email">Email</label>
      <input id="email" type="email" defaultValue="not-an-email" className="invalid" aria-invalid aria-describedby="error" />
      <p id="error" className="error">That doesn't look like an email address</p>
    </div>
  ),
};

export const Subscribed: Story = {
  render: () => (
    <main className="card">
      <h1>Subscribe to our weekly newsletter</h1>
      <p className="lead">One email a week. Unsubscribe anytime.</p>
      <p className="success">You're subscribed 🎉</p>
    </main>
  ),
};
