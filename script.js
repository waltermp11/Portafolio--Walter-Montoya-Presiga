/* =========================================================
   Walter Montoya Presiga — Portafolio
   script.js: menú móvil + captura y envío del formulario
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

/* -------------------- Menú móvil -------------------- */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* -------------------- Formulario de contacto -------------------- */
(function initContactForm() {

  // 👉 Tu correo de destino. Cambia este valor si algún día usas otro correo.
  const DESTINATION_EMAIL = 'walterm2000011@gmail.com';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');

  const fields = {
    name: form.elements['name'],
    email: form.elements['email'],
    message: form.elements['message'],
  };

  function setError(fieldName, msg) {
    const errEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errEl) errEl.textContent = msg || '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    let valid = true;

    if (!fields.name.value.trim()) {
      setError('name', 'Por favor escribe tu nombre.');
      valid = false;
    } else {
      setError('name', '');
    }

    if (!fields.email.value.trim()) {
      setError('email', 'Por favor escribe tu correo.');
      valid = false;
    } else if (!isValidEmail(fields.email.value.trim())) {
      setError('email', 'Ese correo no parece válido.');
      valid = false;
    } else {
      setError('email', '');
    }

    if (!fields.message.value.trim()) {
      setError('message', 'Escribe un mensaje antes de enviar.');
      valid = false;
    } else {
      setError('message', '');
    }

    return valid;
  }

  function setStatus(message, state) {
    statusEl.textContent = message;
    if (state) {
      statusEl.setAttribute('data-state', state);
    } else {
      statusEl.removeAttribute('data-state');
    }
  }

  // Abre el cliente de correo del usuario con el mensaje ya redactado.
  // Es el método de respaldo: no depende de ningún servicio externo.
  function sendViaMailto(data) {
    const subject = encodeURIComponent(`Nuevo mensaje de portafolio — ${data.name}`);
    const body = encodeURIComponent(
      `Nombre: ${data.name}\nCorreo: ${data.email}\n\nMensaje:\n${data.message}`
    );
    window.location.href = `mailto:${DESTINATION_EMAIL}?subject=${subject}&body=${body}`;
  }

  // Envía el formulario directamente a tu correo usando FormSubmit
  // (https://formsubmit.co), sin necesidad de backend propio.
  //
  // IMPORTANTE — activación única: la primera vez que alguien envíe este
  // formulario, FormSubmit te mandará un correo de confirmación a
  // walterm2000011@gmail.com. Debes abrirlo y hacer clic en "Activate Form"
  // para que los envíos siguientes lleguen automáticamente a tu bandeja.
  async function sendViaFormSubmit(data) {
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(DESTINATION_EMAIL)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        _subject: `Nuevo mensaje de portafolio — ${data.name}`,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo enviar el mensaje.');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('', null);

    // Honeypot: si un bot llenó este campo oculto, se descarta el envío
    // silenciosamente (sin dar pistas a los bots de que fue detectado).
    if (form.elements['_honey'] && form.elements['_honey'].value) {
      form.reset();
      return;
    }

    if (!validate()) {
      setStatus('Revisa los campos marcados en rojo.', 'error');
      return;
    }

    const data = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      message: fields.message.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    try {
      await sendViaFormSubmit(data);
      setStatus('¡Mensaje enviado! Te responderé pronto.', 'success');
      form.reset();
    } catch (err) {
      // Si el envío directo falla (por ejemplo, antes de activar FormSubmit
      // o sin conexión), se abre el correo del usuario como respaldo.
      console.error(err);
      setStatus('No se pudo enviar automáticamente, abriendo tu correo…', 'error');
      sendViaMailto(data);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    }
  });
})();
