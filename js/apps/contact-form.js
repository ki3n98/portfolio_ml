// Contact window form, submitted to Web3Forms.

export function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const contactStatus = document.getElementById('contact-form-status');
  const contactSubmitBtn = contactForm.querySelector('.contact-form__submit');
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  function setContactStatus(message, variant) {
    contactStatus.textContent = message;
    contactStatus.classList.remove(
      'contact-form__status--sending',
      'contact-form__status--success',
      'contact-form__status--error'
    );
    if (variant) contactStatus.classList.add(`contact-form__status--${variant}`);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    contactSubmitBtn.disabled = true;
    setContactStatus('Sending…', 'sending');

    fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setContactStatus("Thanks! Your message has been sent — I'll get back to you soon.", 'success');
          contactForm.reset();
        } else {
          setContactStatus(result.message || 'Something went wrong. Please try again or email me directly.', 'error');
        }
      })
      .catch(() => {
        setContactStatus('Network error — please try again or email me directly.', 'error');
      })
      .finally(() => {
        contactSubmitBtn.disabled = false;
      });
  });
}
