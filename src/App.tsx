import { useState, type FormEvent } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function App() {
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = EMAIL_RE.test(email.trim());
    setInvalid(!ok);
    if (ok) setDone(true);
  }

  return (
    <main className="card">
      <h1>Subscribe to our weekly newsletter</h1>
      <p className="lead">One email a week. Unsubscribe anytime.</p>

      {done ? (
        <p id="success" className="success">You're subscribed 🎉</p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={invalid ? 'invalid' : undefined}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'error' : undefined}
          />
          {invalid && (
            <p id="error" className="error">
              That doesn't look like an email address
            </p>
          )}

          <div className="actions">
            <button id="primary-btn" type="submit" className="btn btn-primary">
              Subscribe
            </button>
            <button id="secondary-btn" tabIndex={-1} type="button" className="btn btn-secondary">
              Maybe later
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
