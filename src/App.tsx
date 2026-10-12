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
      <h1>订阅我们的周报</h1>
      <p className="lead">每周一封，随时可以退订。</p>

      {done ? (
        <p id="success" className="success">订阅成功 🎉</p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="email">邮箱</label>
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
              请输入有效的邮箱地址
            </p>
          )}

          <div className="actions">
            <button id="primary-btn" type="submit" className="btn btn-primary">
              订阅
            </button>
            <button id="secondary-btn" type="button" className="btn btn-secondary">
              以后再说
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
