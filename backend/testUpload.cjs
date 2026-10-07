const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function runTest() {
  try {
    const api = axios.create({
      baseURL: 'http://localhost:5001/api',
      withCredentials: true // though we'll manually handle cookies in this script
    });

    // 1. Signup a test user
    const testEmail = `test${Date.now()}@test.com`;
    let cookie = '';
    
    try {
      const res = await api.post('/auth/signup', {
        name: 'Test User',
        email: testEmail,
        password: 'password123',
        phone: '1234567890',
        city: 'Mumbai'
      });
      cookie = res.headers['set-cookie'][0];
      console.log('Signup successful!');
    } catch (err) {
      console.error('Signup failed:', err.response?.data || err.message);
      return;
    }

    // 2. Upload avatar
    const form = new FormData();
    // Create a tiny fake image buffer
    const fakeImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    form.append('avatar', fakeImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    form.append('name', 'Updated Name');

    try {
      const res = await api.put('/users/profile', form, {
        headers: {
          ...form.getHeaders(),
          Cookie: cookie
        }
      });
      console.log('Upload successful!', res.data);
    } catch (err) {
      console.error('Upload failed with 500! Response data:', err.response?.data);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

runTest();
