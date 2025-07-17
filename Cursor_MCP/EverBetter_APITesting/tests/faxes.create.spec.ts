// Test for creating a fax using Playwright APIRequestContext
// To add more APIs, just add new test files in the tests/ folder using the same pattern

import { test, expect } from '@playwright/test';
import { sendRequest } from '../utils/request';

// Test data for the cURL request
const faxPayload = {
  connection_id: '2729119915695933423',
  media_url: 'https://drive.google.com/file/d/16yuN--WT041qz9cKJYpoecXbbWZonh1/view?usp=sharing',
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

test.describe('Faxes API', () => {
  test('should create a fax successfully', async () => {
    const response = await sendRequest('POST', '/faxes', faxPayload);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    expect(response.status).toBe(202);
    expect(response.data).toHaveProperty('data');
  });
});
