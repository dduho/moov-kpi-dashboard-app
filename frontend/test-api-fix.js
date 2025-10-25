// Test script to verify API connectivity after fix
// Copy and paste this into the browser console at http://localhost:5173

console.log('=== TESTING API CONNECTIVITY ===');

// Test 1: Health check
fetch('http://localhost:5173/api/dashboard?date=20241024')
  .then(r => {
    console.log('Dashboard API status:', r.status);
    return r.text();
  })
  .then(d => {
    try {
      const data = JSON.parse(d);
      console.log('✅ Dashboard API works:', data);
    } catch (e) {
      console.log('Dashboard API response (not JSON):', d);
    }
  })
  .catch(e => console.error('❌ Dashboard API failed:', e));

// Test 2: Login API (should work now)
fetch('http://localhost:5173/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'p@ssw0rd'})
})
  .then(r => {
    console.log('Login API status:', r.status);
    return r.text();
  })
  .then(d => {
    try {
      const data = JSON.parse(d);
      console.log('✅ Login API works:', data);
    } catch (e) {
      console.log('Login API response:', d);
    }
  })
  .catch(e => console.error('❌ Login API failed:', e));

// Test 3: Direct backend access (should work)
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'p@ssw0rd'})
})
  .then(r => {
    console.log('Direct backend status:', r.status);
    return r.text();
  })
  .then(d => {
    try {
      const data = JSON.parse(d);
      console.log('✅ Direct backend works:', data);
    } catch (e) {
      console.log('Direct backend response:', d);
    }
  })
  .catch(e => console.error('❌ Direct backend failed:', e));

console.log('=== TESTS COMPLETED ===');