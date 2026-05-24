async function testRegister() {
  const body = {
    name: "Test User Three",
    email: "testuser3@example.com",
    password: "password123",
    role: "HR_ADMIN",
    organizationName: "TestOrgThree"
  };

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const status = res.status;
    const text = await res.text();
    console.log(`Status: ${status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error sending request:', error);
  }
}

testRegister();
