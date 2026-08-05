(() => {
  const gate = document.querySelector('[data-news-access-gate]');
  const form = gate?.querySelector('[data-news-access-form]');
  const input = gate?.querySelector('[data-news-access-input]');
  const error = gate?.querySelector('[data-news-access-error]');

  if (!gate || !form || !input || !error) return;

  const unlock = () => {
    document.body.classList.remove('news-access-protected');
    gate.hidden = true;
    document.querySelector('#main')?.focus({ preventScroll: true });
  };

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
  });

  input.focus({ preventScroll: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    form.classList.remove('is-invalid');

    const value = input.value.trim();
    if (!value) {
      error.textContent = 'Enter the password to continue.';
      form.classList.add('is-invalid');
      input.focus();
      return;
    }

    const encodedPassword = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', encodedPassword);
    const passwordHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

    if (passwordHash !== form.dataset.accessHash) {
      error.textContent = 'Incorrect password. Please try again.';
      form.classList.add('is-invalid');
      input.select();
      return;
    }

    unlock();
  });
})();
