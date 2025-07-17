const { test, expect } = require('@playwright/test');

/**
 * Health First API Test Suite using Playwright APIRequestContext
 * Tests complete user registration, login, and patient CRUD operations
 * 
 * Prerequisites:
 * - npm install @playwright/test
 * - npx playwright install
 * - Ensure your Health First API is running locally
 * - Update baseURL if needed
 */

const CONFIG = {
  baseURL: 'https://c15e8644462c.ngrok-free.app',
  timeout: 30000,
  userCredentials: {
    email: 'test_anup_01@example.com',
    password: 'Test@123'
  },
  patientData: {
    firstName: "John",
    middleName: "Michael",
    lastName: "Doe",
    dateOfBirth: "1990-01-01",
    gender: "male",
    maritalStatus: "single",
    timezone: "America/New_York",
    language: "English",
    ssn: "123-45-6789",
    race: "Caucasian",
    ethnicity: "Non-Hispanic",
    profilePicture: "https://example.com/profile.jpg"
  }
};

test.describe('Health First API Test Suite', () => {
  let apiContext;
  let accessToken;
  let patientId;
  
  test.beforeAll(async ({ playwright }) => {
    // Create API request context with base configuration
    apiContext = await playwright.request.newContext({
      baseURL: CONFIG.baseURL,
      extraHTTPHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: CONFIG.timeout
    });
  });

  test.afterAll(async () => {
    // Dispose of the API context
    await apiContext.dispose();
  });

  test('1️⃣ Register a New User', async () => {
    console.log('🔄 Testing User Registration...');
    
    const response = await apiContext.post('/auth/register', {
      data: CONFIG.userCredentials
    });
    
    console.log(`📊 Registration Response Status: ${response.status()}`);
    
    // Validate status code
    expect([200, 201, 409]).toContain(response.status());
    
    const responseData = await response.json();
    console.log('📋 Registration Response Data:', JSON.stringify(responseData, null, 2));
    
    // Validate required fields only if registration was successful
    if ([200, 201].includes(response.status())) {
      expect(responseData).toHaveProperty('createdAt');
      expect(responseData).toHaveProperty('updatedAt');
      expect(responseData).toHaveProperty('id');
    }
    
    console.log('✅ User registration successful');
    console.log(`👤 User ID: ${responseData.id}`);
  });

  test('2️⃣ Login User', async () => {
    console.log('🔄 Testing User Login...');
    
    const response = await apiContext.post('/auth/login', {
      data: CONFIG.userCredentials
    });
    
    console.log(`📊 Login Response Status: ${response.status()}`);
    
    // Validate status code
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    console.log('📋 Login Response Data:', JSON.stringify(responseData, null, 2));
    
    // Extract access token (try different possible field names)
    accessToken = responseData.accessToken || responseData.token || responseData.access_token;
    
    expect(accessToken).toBeDefined();
    expect(accessToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/); // JWT format
    
    console.log('✅ User login successful');
    console.log(`🔑 Access Token Length: ${accessToken.length}`);
    console.log(`🔑 Token Preview: ${accessToken.substring(0, 20)}...`);
  });

  test('3️⃣ Create Authenticated API Context', async ({ playwright }) => {
    console.log('🔄 Setting up authenticated API context...');
    
    // Dispose of the previous context
    await apiContext.dispose();
    
    // Create new authenticated context
    apiContext = await playwright.request.newContext({
      baseURL: CONFIG.baseURL,
    extraHTTPHeaders: {
        'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: CONFIG.timeout
    });
    
    console.log('✅ Authenticated API context created');
    console.log(`🔐 Authorization header set with Bearer token`);
  });

  test('4️⃣ Create a Patient', async () => {
    console.log('🔄 Testing Patient Creation...');
    
    const response = await apiContext.post('/patients', {
      data: CONFIG.patientData
    });
    
    console.log(`📊 Patient Creation Response Status: ${response.status()}`);
    
    // Validate status code
    expect([200, 201]).toContain(response.status());
    
    const responseData = await response.json();
    console.log('📋 Patient Creation Response Data:', JSON.stringify(responseData, null, 2));
    
    // Extract patient ID
    patientId = responseData.id;
    expect(patientId).toBeDefined();
    
    // Validate patient data
    expect(responseData.firstName).toBe(CONFIG.patientData.firstName);
    expect(responseData.lastName).toBe(CONFIG.patientData.lastName);
    expect(responseData.dateOfBirth).toBe(CONFIG.patientData.dateOfBirth);
    
    console.log('✅ Patient creation successful');
    console.log(`👤 Patient ID: ${patientId}`);
  });

  test('5️⃣ Get Patient', async () => {
    console.log('🔄 Testing Patient Retrieval...');
    
    const response = await apiContext.get(`/patients/${patientId}`);
    
    console.log(`📊 Patient Retrieval Response Status: ${response.status()}`);
    
    // Validate status code
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    console.log('📋 Patient Retrieval Response Data:', JSON.stringify(responseData, null, 2));
    
    // Verify patient ID matches
    expect(responseData.id).toBe(patientId);
    
    // Verify patient data
    expect(responseData.firstName).toBe(CONFIG.patientData.firstName);
    expect(responseData.lastName).toBe(CONFIG.patientData.lastName);
    expect(responseData.dateOfBirth).toBe(CONFIG.patientData.dateOfBirth);
    
    console.log('✅ Patient retrieval successful');
    console.log(`🔍 Retrieved Patient ID: ${responseData.id}`);
  });

  test('6️⃣ Update Patient', async () => {
    console.log('🔄 Testing Patient Update...');
    
    const updateData = {
      firstName: "John Updated",
      middleName: "Mike"
    };
    
    const response = await apiContext.patch(`/patients/${patientId}`, {
      data: updateData
    });
    
    console.log(`📊 Patient Update Response Status: ${response.status()}`);
    
    // Validate status code
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    console.log('📋 Patient Update Response Data:', JSON.stringify(responseData, null, 2));
    
    // Verify updated fields
    expect(responseData.firstName).toBe(updateData.firstName);
    expect(responseData.middleName).toBe(updateData.middleName);
    
    // Verify unchanged fields
    expect(responseData.lastName).toBe(CONFIG.patientData.lastName);
    expect(responseData.id).toBe(patientId);
    
    console.log('✅ Patient update successful');
    console.log(`📝 Updated firstName: ${responseData.firstName}`);
    console.log(`📝 Updated middleName: ${responseData.middleName}`);
  });

  test('7️⃣ Delete Patient', async () => {
    console.log('🔄 Testing Patient Deletion...');
    
    const response = await apiContext.delete(`/patients/${patientId}`);
    
    console.log(`📊 Patient Deletion Response Status: ${response.status()}`);
    
    // Validate status code
    expect([200, 204]).toContain(response.status());
    
    console.log('✅ Patient deletion successful');
    console.log(`🗑️ Patient ${patientId} deleted`);
  });

  test('8️⃣ Verify Deletion', async () => {
    console.log('🔄 Testing Deletion Verification...');
    
    const response = await apiContext.get(`/patients/${patientId}`);
    
    console.log(`📊 Deletion Verification Response Status: ${response.status()}`);
    
    // Validate that patient no longer exists
    expect(response.status()).toBe(404);
    
    console.log('✅ Deletion verification successful');
    console.log(`🚫 Patient ${patientId} no longer exists (404)`);
  });
});

/**
 * Alternative: Run tests individually for debugging
 */
test.describe('Health First API - Individual Test Runner', () => {
  test.skip('Run Complete Test Sequence', async ({ playwright }) => {
    // This test can be used to run all operations in a single test
    // Uncomment and modify as needed for debugging
    
    console.log('🚀 Starting complete API test sequence...');
    
    // Create initial API context
    const apiContext = await playwright.request.newContext({
      baseURL: CONFIG.baseURL,
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: CONFIG.timeout
    });
    
    try {
      // Run all operations sequentially
      // Implementation would go here...
      
      console.log('✅ Complete test sequence finished successfully');
    } catch (error) {
      console.error('❌ Test sequence failed:', error);
      throw error;
    } finally {
      await apiContext.dispose();
    }
  });
});

/**
 * Configuration validation test
 */
test.describe('Configuration Validation', () => {
  test('Validate API Connectivity', async ({ playwright }) => {
    console.log('🔍 Testing API connectivity...');
    
    const apiContext = await playwright.request.newContext({
      baseURL: CONFIG.baseURL,
      extraHTTPHeaders: {
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: CONFIG.timeout
    });
    
    try {
      const response = await apiContext.get('/');
      console.log(`📊 Connectivity Response Status: ${response.status()}`);
      
      expect(response.status()).toBeLessThan(500);
      console.log('✅ API is accessible');
    } catch (error) {
      console.error('❌ API connectivity failed:', error);
      throw error;
    } finally {
  await apiContext.dispose();
    }
  });
});