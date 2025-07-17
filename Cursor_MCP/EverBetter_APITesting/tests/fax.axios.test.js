// Minimal Node.js test using axios to debug Telnyx API 404 issue
const axios = require('axios');

(async () => {
  try {
    const response = await axios.post(
      'https://api.telnyx.com/v2/faxes',
      {
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
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer KEY0197C111B2152767B921C14D1DAA689C_n5x5Jc842FX1cGkCBCpstA',
          'User-Agent': 'PostmanRuntime/7.32.2'
        }
      }
    );
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
})();
