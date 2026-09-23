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
      if (form.method.toLowerCase() === 'get') {
        appendUtmToGetForm(form);
      }
    });
  });
})();
