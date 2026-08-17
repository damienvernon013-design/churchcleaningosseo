const CRM_ENDPOINT = 'https://thequotemasters.com/crm_api/api.php?action=push_lead';
const DEFAULT_INDUSTRY = 23;
const ZIP_REGEX = /^\d{5}$/;

function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/);
  const first = parts.shift() || '';
  const last = parts.join(' ');
  return { first_name: first, last_name: last };
}

function sanitizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.CRM_API_TOKEN;
  if (!token) {
    console.error('submit-lead: CRM_API_TOKEN is not configured');
    return res.status(500).json({ error: 'Server is not configured to accept quote requests right now.' });
  }

  const body = req.body || {};
  const { name, facility, city, service, phone, notes, title, zip, utm_source } = body;

  if (!name || !facility || !city || !phone) {
    return res.status(400).json({ error: 'Name, facility, city, and phone are required.' });
  }

  const { first_name, last_name } = splitName(name);
  const cleanZip = ZIP_REGEX.test(String(zip || '').trim()) ? String(zip).trim() : '';

  const payload = {
    zip: cleanZip,
    customer: {
      company_name: sanitizeText(facility, 255),
      first_name: sanitizeText(first_name, 100),
      last_name: sanitizeText(last_name, 100),
      position: sanitizeText(title, 100),
      phone: sanitizeText(phone, 20).replace(/[^\d]/g, ''),
      email: '',
      email2: '',
      address: sanitizeText(city, 255),
      service_address: sanitizeText(city, 255),
      notes: [service ? `Service requested: ${sanitizeText(service, 200)}` : '', sanitizeText(notes, 1000)]
        .filter(Boolean)
        .join(' | '),
    },
    industry: DEFAULT_INDUSTRY,
    questions: [],
    appointments: [],
    number_of_quotes: '1',
    utm_source: sanitizeText(utm_source, 255),
  };

  try {
    const crmResponse = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await crmResponse.text();

    if (!crmResponse.ok) {
      console.error('submit-lead: CRM rejected the request', crmResponse.status, responseText);
      return res.status(502).json({ error: 'We could not submit your request right now. Please call us instead.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-lead: request to CRM failed', err);
    return res.status(502).json({ error: 'We could not submit your request right now. Please call us instead.' });
  }
};
