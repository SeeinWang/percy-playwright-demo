import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from '../App';

// Each story is one Percy snapshot. States are set directly in markup,
// instead of being clicked into as the Playwright tests do.

const meta: Meta = { title: 'Signup' };
export default meta;
type Story = StoryObj;

export const Card: Story = { render: () => <App /> };

export const Buttons: Story = {
  render: () => (
    <div className="card">
      <div className="actions">
        <button type="button" className="btn btn-primary">Subscribe</button>
        <button type="button" className="btn btn-secondary">Maybe later</button>
      </div>
    </div>
  ),
};

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
