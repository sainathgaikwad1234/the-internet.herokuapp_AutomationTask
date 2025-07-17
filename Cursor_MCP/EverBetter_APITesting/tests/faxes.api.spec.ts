import { test, expect, request } from '@playwright/test';

const BASE_URL = 'https://api.telnyx.com/v2/faxes';
const VALID_TOKEN = 'Bearer KEY0197C111B2152767B921C14D1DAA689C_n5x5Jc842FX1cGkCBCpstA';
const INVALID_TOKEN = 'Bearer INVALID_TOKEN';

const validPayload = {
  connection_id: '2729119915695933423',
  media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  to: '+13127367276',
  from: '+13125790015',
  from_display_name: 'Thinkitive',
  quality: 'high',
  t38_enabled: true,
  monochrome: false,
  store_media: false,
  store_preview: false,
  preview_format: 'tiff',
  webhook_url: 'https://www.example.com/server-b/',
  client_state: 'aGF2ZSBhIG5pY2UgZGF5ID1d'
};

test.describe('Telnyx /v2/faxes API', () => {
  // Positive: All fields valid
  test('should queue fax with all valid fields', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: validPayload,
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([200, 201, 202]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
  });

  // Positive: monochrome true
  test('should send fax as black & white when monochrome is true', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, monochrome: true },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([200, 201, 202]).toContain(response.status());
  });

  // Positive: without store_media and store_preview
  test('should send fax without storing media or preview', async ({ request }) => {
    const { store_media, store_preview, ...payload } = validPayload;
    const response = await request.post(BASE_URL, {
      data: payload,
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([200, 201, 202]).toContain(response.status());
  });

  // Positive: valid media_url
  test('should render and send document from valid media_url', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([200, 201, 202]).toContain(response.status());
  });

  // Positive: international number
  test('should accept and transmit fax to international number', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, to: '+442083661177' }, // UK number
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([200, 201, 202]).toContain(response.status());
  });

  // Negative: both media_url and media_name
  test('should return 422 when both media_url and media_name are provided', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, media_name: 'test.pdf' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect(response.status()).toBe(422);
  });

  // Negative: invalid phone number format
  test('should reject invalid phone number format', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, to: '12345' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([400, 422]).toContain(response.status());
  });

  // Negative: missing media_url
  test('should return 422 when media_url is missing', async ({ request }) => {
    const { media_url, ...payload } = validPayload;
    const response = await request.post(BASE_URL, {
      data: payload,
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect(response.status()).toBe(422);
  });

  // Negative: invalid media_url (not publicly accessible)
  test('should return 202, 422 or 500 for invalid media_url', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, media_url: 'https://invalid-url.com/file.pdf' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([202, 422, 500]).toContain(response.status());
  });

  // Negative: invalid preview_format
  test('should return 400 or 422 for unsupported preview_format', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, preview_format: 'jpeg' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([400, 422]).toContain(response.status());
  });

  // Negative: unsupported file type in media_url
  test('should return 202 or 415 for unsupported file type in media_url', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      data: { ...validPayload, media_url: 'https://example.com/file.exe' },
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    expect([202, 415]).toContain(response.status());
  });

  // Negative: invalid or malformed JSON payload
  test('should return 400 or 422 for malformed JSON payload', async ({ playwright }) => {
    // Playwright's request API does not allow sending malformed JSON directly,
    // so we use APIRequestContext and pass a string as the body.
    const apiRequestContext = await playwright.request.newContext();
    const response = await apiRequestContext.post(BASE_URL, {
      headers: {
        'Authorization': VALID_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Intentionally malformed JSON
      data: '{"invalidJson": true,'
    });
    expect([400, 422]).toContain(response.status());
    await apiRequestContext.dispose();
  });
}); 