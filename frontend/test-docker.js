// Test script to verify Docker connectivity
// Copy and paste this into the browser console at http://localhost:5173

console.log('Testing Docker connectivity...');

// Test 1: Health check
fetch('http://localhost:8000/health')
  .then(r => r.text())
  .then(d => console.log('✅ Health check:', d))
  .catch(e => console.error('❌ Health check failed:', e));

// Test 2: Login API
fetch('http://localhost:5173/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'p@ssw0rd'})
})
  .then(r => {
    console.log('Login response status:', r.status);
    return r.text();
  })
  .then(d => console.log('Login response:', d))
  .catch(e => console.error('❌ Login request failed:', e));

// Test 3: Direct backend access (should work in Docker)
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'p@ssw0rd'})
})
  .then(r => {
    console.log('Direct backend response status:', r.status);
    return r.text();
  })
  .then(d => console.log('Direct backend response:', d))
  .catch(e => console.error('❌ Direct backend failed:', e));