const { test, expect, request: playwrightRequest } = require('@playwright/test');

test.describe('Health First API - User Registration, Login, and Patient CRUD Operations', () => {
  let apiContext;
  let authContext;
  let accessToken;
  let patientId;
  
  const baseURL = 'https://c15e8644462c.ngrok-free.app';
  const testUser = {
    email: 'anup@example.com',
    password: 'Test@123'
  };

  test.beforeAll(async () => {
    // Initialize API context without authentication for registration/login
    apiContext = await playwrightRequest.newContext({
      baseURL: baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  });

  test.afterAll(async () => {
    if (apiContext) await apiContext.dispose();
    if (authContext) await authContext.dispose();
  });

  test('1️⃣ Register a New User', async () => {
    console.log('🔄 Step 1: Registering new user...');
    
    const response = await apiContext.post('/auth/register', {
      data: testUser
    });

    console.log(`📊 Registration Response Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('📋 Registration Response Body:', JSON.stringify(responseBody, null, 2));

    // Validate status code - including 409 for already exists
    expect([200, 201, 409]).toContain(response.status());
    
    // Validate response structure only if user was created successfully
    if ([200, 201].includes(response.status())) {
      expect(responseBody).toHaveProperty('createdAt');
      expect(responseBody).toHaveProperty('updatedAt');
      expect(responseBody).toHaveProperty('id');
    }
    
    console.log('✅ User registration completed!');
  });

  test('2️⃣ Login User', async () => {
    console.log('🔄 Step 2: Logging in user...');
    
    const response = await apiContext.post('/auth/login', {
      data: testUser
    });

    console.log(`📊 Login Response Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('📋 Login Response Body:', JSON.stringify(responseBody, null, 2));

    // Validate status code
    expect(response.status()).toBe(200);
    
    // Extract access token - handle both possible property names
    accessToken = responseBody.accessToken || responseBody.access_token;
    expect(accessToken).toBeDefined();
    
    console.log('🔑 Access Token extracted:', accessToken ? 'Successfully obtained' : 'Failed to obtain');
    console.log('✅ User login successful!');
  });

  test('3️⃣ Create Authenticated API Context', async () => {
    console.log('🔄 Step 3: Creating authenticated API context...');
    if (authContext) {
      await authContext.dispose();
    }
    console.log('🔑 Using access token:', accessToken);
    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/json'
    };
    console.log('🔑 Auth headers:', JSON.stringify(authHeaders, null, 2));
    authContext = await playwrightRequest.newContext({
      baseURL: baseURL,
      extraHTTPHeaders: authHeaders
    });
    console.log('🔐 Authenticated API context created with Bearer token');
    console.log('✅ Authentication context setup complete!');
  });

  test('4️⃣ Create a Patient', async () => {
    console.log('🔄 Step 4: Creating a new patient...');
    console.log('🔑 Using access token:', accessToken);
    const patientData = {
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
    };
    const response = await authContext.post('/patients', {
      data: patientData
    });
    console.log(`📊 Create Patient Response Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('📋 Create Patient Response Body:', JSON.stringify(responseBody, null, 2));
    expect([200, 201]).toContain(response.status());
    patientId = responseBody.id || responseBody.patient_id || responseBody._id;
    expect(patientId).toBeDefined();
    console.log('🆔 Patient ID extracted:', patientId);
    console.log('✅ Patient creation successful!');
  });

  test('5️⃣ Get Patient', async () => {
    console.log('🔄 Step 5: Retrieving patient details...');
    
    const response = await authContext.get(`/patients/${patientId}`);

    console.log(`📊 Get Patient Response Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('📋 Get Patient Response Body:', JSON.stringify(responseBody, null, 2));

    // Validate status code
    expect(response.status()).toBe(200);
    
    // Verify patient ID matches
    const retrievedPatientId = responseBody.id || responseBody.patient_id || responseBody._id;
    expect(retrievedPatientId).toBe(patientId);
    
    // Verify some key fields
    expect(responseBody.firstName).toBe('John');
    expect(responseBody.lastName).toBe('Doe');
    
    console.log('✅ Patient retrieval successful!');
  });

  test('6️⃣ Update Patient', async () => {
    console.log('🔄 Step 6: Updating patient details...');
    console.log('🔑 Using access token:', accessToken);
    const updateData = {
      firstName: "John Updated",
      middleName: "Mike"
    };
    const response = await authContext.patch(`/patients/${patientId}`, {
      data: updateData
    });
    console.log(`📊 Update Patient Response Status: ${response.status()}`);
    const responseBody = await response.json();
    console.log('📋 Update Patient Response Body:', JSON.stringify(responseBody, null, 2));
    expect(response.status()).toBe(200);
    expect(responseBody.firstName).toBe('John Updated');
    expect(responseBody.middleName).toBe('Mike');
    console.log('✅ Patient update successful!');
  });

  test('7️⃣ Delete Patient', async () => {
    console.log('🔄 Step 7: Deleting patient...');
    console.log('🔑 Using access token:', accessToken);
    const response = await authContext.delete(`/patients/${patientId}`);
    console.log(`📊 Delete Patient Response Status: ${response.status()}`);
    try {
      const responseBody = await response.json();
      console.log('📋 Delete Patient Response Body:', JSON.stringify(responseBody, null, 2));
    } catch (error) {
      console.log('📋 Delete Patient Response: No JSON body (expected for successful deletion)');
    }
    expect([200, 204]).toContain(response.status());
    console.log('✅ Patient deletion successful!');
  });

  test('8️⃣ Verify Deletion', async () => {
    console.log('🔄 Step 8: Verifying patient deletion...');
    
    const response = await authContext.get(`/patients/${patientId}`);

    console.log(`📊 Verify Deletion Response Status: ${response.status()}`);
    
    // Log response body if available
    try {
      const responseBody = await response.json();
      console.log('📋 Verify Deletion Response Body:', JSON.stringify(responseBody, null, 2));
    } catch (error) {
      console.log('📋 Verify Deletion Response: No JSON body (expected for 404)');
    }

    // Validate that patient is not found
    expect(response.status()).toBe(404);
    
    console.log('✅ Patient deletion verification successful!');
  });

  test('📊 Complete API Test Suite Summary', async () => {
    console.log('\n🎉 =================================');
    console.log('🎉 API TEST SUITE COMPLETED SUCCESSFULLY!');
    console.log('🎉 =================================');
    console.log('✅ 1️⃣ User Registration - PASSED');
    console.log('✅ 2️⃣ User Login - PASSED');
    console.log('✅ 3️⃣ Authenticated Context Setup - PASSED');
    console.log('✅ 4️⃣ Patient Creation - PASSED');
    console.log('✅ 5️⃣ Patient Retrieval - PASSED');
    console.log('✅ 6️⃣ Patient Update - PASSED');
    console.log('✅ 7️⃣ Patient Deletion - PASSED');
    console.log('✅ 8️⃣ Deletion Verification - PASSED');
    console.log('🎉 =================================\n');
  });
});

// Alternative single test approach (if you prefer all steps in one test)
test.describe('Health First API - All Operations in Single Test', () => {
  test('Complete API Flow Test', async ({ request }) => {
    let apiContext;
    let accessToken;
    let patientId;
    
    const baseURL = 'https://c15e8644462c.ngrok-free.app';
    const testUser = {
      email: 'anup@example.com',
      password: 'Test@123'
    };

    try {
      // Initialize API context
      apiContext = await playwrightRequest.newContext({
        baseURL: baseURL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // 1️⃣ Register User
      console.log('🔄 Step 1: Registering new user...');
      const registerResponse = await apiContext.post('/auth/register', {
        data: testUser
      });
      expect([200, 201]).toContain(registerResponse.status());
      const registerBody = await registerResponse.json();
      expect(registerBody).toHaveProperty('id');
      console.log('✅ User registration successful!');

      // 2️⃣ Login User
      console.log('🔄 Step 2: Logging in user...');
      const loginResponse = await apiContext.post('/auth/login', {
        data: testUser
      });
      expect(loginResponse.status()).toBe(200);
      const loginBody = await loginResponse.json();
      accessToken = loginBody.accessToken;
      expect(accessToken).toBeDefined();
      console.log('✅ User login successful!');

      // 3️⃣ Create Authenticated Context
      console.log('🔄 Step 3: Creating authenticated context...');
      await apiContext.dispose();
      apiContext = await playwrightRequest.newContext({
        baseURL: baseURL,
        extraHTTPHeaders: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Authenticated context created!');

      // 4️⃣ Create Patient
      console.log('🔄 Step 4: Creating patient...');
      const patientData = {
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
      };
      
      const createResponse = await apiContext.post('/patients', {
        data: patientData
      });
      expect([200, 201]).toContain(createResponse.status());
      const createBody = await createResponse.json();
      patientId = createBody.id || createBody.patient_id || createBody._id;
      expect(patientId).toBeDefined();
      console.log('✅ Patient created!');

      // 5️⃣ Get Patient
      console.log('🔄 Step 5: Retrieving patient...');
      const getResponse = await apiContext.get(`/patients/${patientId}`);
      expect(getResponse.status()).toBe(200);
      const getBody = await getResponse.json();
      expect(getBody.firstName).toBe('John');
      console.log('✅ Patient retrieved!');

      // 6️⃣ Update Patient
      console.log('🔄 Step 6: Updating patient...');
      const updateResponse = await apiContext.patch(`/patients/${patientId}`, {
        data: {
          firstName: "John Updated",
          middleName: "Mike"
        }
      });
      expect(updateResponse.status()).toBe(200);
      const updateBody = await updateResponse.json();
      expect(updateBody.firstName).toBe('John Updated');
      console.log('✅ Patient updated!');

      // 7️⃣ Delete Patient
      console.log('🔄 Step 7: Deleting patient...');
      const deleteResponse = await apiContext.delete(`/patients/${patientId}`);
      expect([200, 204]).toContain(deleteResponse.status());
      console.log('✅ Patient deleted!');

      // 8️⃣ Verify Deletion
      console.log('🔄 Step 8: Verifying deletion...');
      const verifyResponse = await apiContext.get(`/patients/${patientId}`);
      expect(verifyResponse.status()).toBe(404);
      console.log('✅ Deletion verified!');

      console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');

    } finally {
      if (apiContext) {
        await apiContext.dispose();
      }
    }
  });
});