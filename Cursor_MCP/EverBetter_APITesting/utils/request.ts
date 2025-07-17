// Utility for sending API requests using axios (since Playwright APIRequestContext has issues with Telnyx)
// Reusable for all future APIs. No need to change this file for new APIs.

import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from '../config/config';

export async function sendRequest(
  method: Method,
  endpoint: string,
  data?: any
) {
  const url = endpoint.startsWith('http') ? endpoint : `${config.baseURL}${endpoint}`;
  const headers = { ...config.defaultHeaders };
  console.log('--- API REQUEST (axios) ---');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Headers:', headers);
  console.log('Data:', JSON.stringify(data, null, 2));
  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
      validateStatus: () => true // Don't throw on non-2xx
    });
    return response;
  } catch (error) {
    console.error('Axios error:', error);
    throw error;
  }
}
