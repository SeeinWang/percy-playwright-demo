const form = document.getElementById('signup');
const email = document.getElementById('email');
const error = document.getElementById('error');
const success = document.getElementById('success');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  email.classList.toggle('invalid', !ok);
  error.hidden = ok;
  if (ok) {
    form.hidden = true;
    success.hidden = false;
  }
});
