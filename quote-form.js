(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORAGE_KEY = 'qm_utm_params';

  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var found = {};
    var hasAny = false;
    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        found[key] = value;
        hasAny = true;
      }
    });
    if (hasAny) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      } catch (e) {}
    }
  }

  function getStoredUtm() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function applyUtmToForm(form) {
    var stored = getStoredUtm();
    var utmSourceField = form.querySelector('[name="utm_source"]');
    if (utmSourceField && stored.utm_source) {
      utmSourceField.value = stored.utm_source;
    }
  }

  function setStatus(form, message, isError) {
    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      form.appendChild(status);
    }
    status.textContent = message;
    status.style.color = isError ? '#b3261e' : '#1a2e4a';
  }

  function handleSubmit(form) {
    form.addEventListener('submit', function (event) {
      if (form.dataset.submitMode !== 'api') return;
      event.preventDefault();

      var submitButton = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);
      var stored = getStoredUtm();
      var payload = {
        name: formData.get('name'),
        title: formData.get('title'),
        facility: formData.get('facility'),
        city: formData.get('city'),
        service: formData.get('service'),
        size: formData.get('size'),
        phone: formData.get('phone'),
        notes: formData.get('notes'),
        zip: formData.get('zip'),
        utm_source: formData.get('utm_source') || stored.utm_source || '',
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      setStatus(form, '', false);

      fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            form.reset();
            setStatus(form, 'Thank you. We will call you by the next business day.', false);
          } else {
            setStatus(form, (result.data && result.data.error) || 'Something went wrong. Please call us instead.', true);
          }
        })
        .catch(function () {
          setStatus(form, 'Something went wrong. Please call us instead.', true);
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send my quote request';
          }
        });
    });
  }

  function prefillFromQuery(form) {
    var params = new URLSearchParams(window.location.search);
    ['name', 'facility', 'city', 'service', 'phone'].forEach(function (key) {
      var field = form.querySelector('[name="' + key + '"]');
      var value = params.get(key);
      if (field && value) field.value = value;
    });
  }

  function appendUtmToGetForm(form) {
    var stored = getStoredUtm();
    if (!stored.utm_source) return;
    var hidden = form.querySelector('input[name="utm_source"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'utm_source';
      form.appendChild(hidden);
    }
    hidden.value = stored.utm_source;
  }

  document.addEventListener('DOMContentLoaded', function () {
    captureUtm();
    var forms = document.querySelectorAll('form.quote-form');
    forms.forEach(function (form) {
      applyUtmToForm(form);
      prefillFromQuery(form);
      if (form.dataset.submitMode === 'api') {
        handleSubmit(form);
      } else if (form.method.toLowerCase() === 'get') {
        appendUtmToGetForm(form);
      }
    });
  });
})();
