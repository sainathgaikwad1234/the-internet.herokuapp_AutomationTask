const { test, expect } = require('@playwright/test');

test.describe('Health First API - Complete User & Patient CRUD Tests', () => {
  const baseURL = 'https://9915c0249f82.ngrok-free.app';
  let accessToken = '';
  let patientId = '';

  test('Complete API Test Flow - Register → Login → Patient CRUD', async ({ request }) => {
    console.log('🚀 Starting Health First API Test Suite...\n');

    // 1️⃣ Register a New User
    console.log('1️⃣ Registering new user...');
    const registerResponse = await request.post(`${baseURL}/auth/register`, {
      data: {
        email: "test_anup_01@example.com",
        password: "Test@123"
      }
    });

    console.log(`Registration Status: ${registerResponse.status()}`);
    expect([200, 201]).toContain(registerResponse.status());

    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData);
    
    // Validate required fields
    expect(registerData).toHaveProperty('createdAt');
    expect(registerData).toHaveProperty('updatedAt');
    expect(registerData).toHaveProperty('id');
    console.log('✅ User registration successful!\n');

    // 2️⃣ Login User
    console.log('2️⃣ Logging in user...');
    const loginResponse = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: "test_anup_01@example.com",
        password: "Test@123"
      }
    });

    console.log(`Login Status: ${loginResponse.status()}`);
    expect(loginResponse.status()).toBe(200);

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    // Extract access token
    accessToken = loginData.accessToken;
    expect(accessToken).toBeDefined();
    expect(accessToken).not.toBe('');
    console.log('✅ User login successful! Token extracted.\n');

    // 3️⃣ Create Authenticated API Context
    console.log('3️⃣ Creating authenticated API context...');
    const authenticatedRequest = await request.newContext({
      baseURL: baseURL,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Authenticated context created!\n');

    // 4️⃣ Create a Patient
    console.log('4️⃣ Creating patient...');
    const createPatientResponse = await authenticatedRequest.post('/patients', {
      data: {
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
    });

    console.log(`Create Patient Status: ${createPatientResponse.status()}`);
    expect([200, 201]).toContain(createPatientResponse.status());

    const patientData = await createPatientResponse.json();
    console.log('Create Patient Response:', patientData);
    
    // Extract patient ID
    patientId = patientData.id;
    expect(patientId).toBeDefined();
    expect(patientId).not.toBe('');
    console.log(`✅ Patient created successfully! Patient ID: ${patientId}\n`);

    // 5️⃣ Get Patient
    console.log('5️⃣ Retrieving patient...');
    const getPatientResponse = await authenticatedRequest.get(`/patients/${patientId}`);

    console.log(`Get Patient Status: ${getPatientResponse.status()}`);
    expect(getPatientResponse.status()).toBe(200);

    const retrievedPatientData = await getPatientResponse.json();
    console.log('Retrieved Patient Data:', retrievedPatientData);
    
    // Verify patient ID matches
    expect(retrievedPatientData.id).toBe(patientId);
    expect(retrievedPatientData.firstName).toBe('John');
    expect(retrievedPatientData.lastName).toBe('Doe');
    console.log('✅ Patient retrieved successfully!\n');

    // 6️⃣ Update Patient
    console.log('6️⃣ Updating patient...');
    const updatePatientResponse = await authenticatedRequest.patch(`/patients/${patientId}`, {
      data: {
        firstName: "John Updated",
        middleName: "Mike"
      }
    });

    console.log(`Update Patient Status: ${updatePatientResponse.status()}`);
    expect(updatePatientResponse.status()).toBe(200);

    const updatedPatientData = await updatePatientResponse.json();
    console.log('Updated Patient Data:', updatedPatientData);
    
    // Verify updated fields
    expect(updatedPatientData.firstName).toBe('John Updated');
    expect(updatedPatientData.middleName).toBe('Mike');
    console.log('✅ Patient updated successfully!\n');

    // 7️⃣ Delete Patient
    console.log('7️⃣ Deleting patient...');
    const deletePatientResponse = await authenticatedRequest.delete(`/patients/${patientId}`);

    console.log(`Delete Patient Status: ${deletePatientResponse.status()}`);
    expect([200, 204]).toContain(deletePatientResponse.status());
    console.log('✅ Patient deleted successfully!\n');

    // 8️⃣ Verify Deletion
    console.log('8️⃣ Verifying patient deletion...');
    const verifyDeletionResponse = await authenticatedRequest.get(`/patients/${patientId}`);

    console.log(`Verify Deletion Status: ${verifyDeletionResponse.status()}`);
    expect(verifyDeletionResponse.status()).toBe(404);
    console.log('✅ Patient deletion verified - patient no longer exists!\n');

    // Clean up authenticated context
    await authenticatedRequest.dispose();
    
    console.log('🎉 All tests completed successfully!');
    console.log('Test Summary:');
    console.log('- ✅ User Registration');
    console.log('- ✅ User Login');
    console.log('- ✅ Patient Creation');
    console.log('- ✅ Patient Retrieval');
    console.log('- ✅ Patient Update');
    console.log('- ✅ Patient Deletion');
    console.log('- ✅ Deletion Verification');
  });

  // Alternative test structure - Individual test cases
  test.describe('Individual Test Cases', () => {
    let authenticatedRequest;

    test.beforeAll(async ({ request }) => {
      // Setup: Register and login to get token
      const registerResponse = await request.post(`${baseURL}/auth/register`, {
        data: {
          email: "test_anup_setup@example.com",
          password: "Test@123"
        }
      });

      const loginResponse = await request.post(`${baseURL}/auth/login`, {
        data: {
          email: "test_anup_setup@example.com",
          password: "Test@123"
        }
      });

      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;

      authenticatedRequest = await request.newContext({
        baseURL: baseURL,
        extraHTTPHeaders: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/json'
        }
      });
    });

    test.afterAll(async () => {
      if (authenticatedRequest) {
        await authenticatedRequest.dispose();
      }
    });

    test('Should register a new user', async ({ request }) => {
      const response = await request.post(`${baseURL}/auth/register`, {
        data: {
          email: "test_individual_01@example.com",
          password: "Test@123"
        }
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
      expect(data).toHaveProperty('id');
    });

    test('Should login successfully', async ({ request }) => {
      const response = await request.post(`${baseURL}/auth/login`, {
        data: {
          email: "test_anup_setup@example.com",
          password: "Test@123"
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('accessToken');
    });

    test('Should create a patient', async () => {
      const response = await authenticatedRequest.post('/patients', {
        data: {
          firstName: "Jane",
          middleName: "Mary",
          lastName: "Smith",
          dateOfBirth: "1985-05-15",
          gender: "female",
          maritalStatus: "married",
          timezone: "America/Los_Angeles",
          language: "English",
          ssn: "987-65-4321",
          race: "Asian",
          ethnicity: "Non-Hispanic",
          profilePicture: "https://example.com/jane.jpg"
        }
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.firstName).toBe('Jane');
    });
  });
});

// Configuration for running tests
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'https://9915c0249f82.ngrok-free.app',
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['line']
  ]
};