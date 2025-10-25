// Diagnostic script for network and performance issues
// Run this in the browser console on the login page

console.log('=== DIAGNOSTIC START ===');

// 1. Test basic connectivity
console.log('1. Testing basic connectivity...');
fetch('http://localhost:8000/health')
  .then(response => {
    console.log('✅ Health check successful:', response.status);
    return response.text();
  })
  .then(data => console.log('Health response:', data))
  .catch(error => console.error('❌ Health check failed:', error));

// 2. Test login endpoint
console.log('2. Testing login endpoint...');
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'p@ssw0rd' })
})
  .then(response => {
    console.log('Login response status:', response.status);
    return response.text();
  })
  .then(data => console.log('Login response:', data))
  .catch(error => console.error('❌ Login request failed:', error));

// 3. Test Vue reactivity
console.log('3. Testing Vue reactivity...');
if (window.Vue) {
  console.log('✅ Vue is available');
} else {
  console.log('❌ Vue not found');
}

// 4. Check for security extensions
console.log('4. Checking for security extensions...');
const extensions = [];
if (window.navigator.plugins) {
  for (let i = 0; i < navigator.plugins.length; i++) {
    extensions.push(navigator.plugins[i].name);
  }
}
console.log('Browser plugins:', extensions);

// 5. Performance timing
console.log('5. Performance timing...');
if (window.performance && window.performance.timing) {
  const timing = window.performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  console.log('Page load time:', loadTime + 'ms');
}

// 6. Network information
console.log('6. Network information...');
if ('connection' in navigator) {
  console.log('Connection type:', navigator.connection.effectiveType);
  console.log('Downlink:', navigator.connection.downlink + ' Mbps');
}

// 7. Check for blocking extensions
console.log('7. Checking for known blocking patterns...');
const suspiciousLogs = [];
const originalLog = console.log;
console.log = function(...args) {
  if (args.some(arg => typeof arg === 'string' && (
    arg.includes('Content Script Bridge') ||
    arg.includes('TSS:') ||
    arg.includes('protection') ||
    arg.includes('scams')
  ))) {
    suspiciousLogs.push(args.join(' '));
  }
  originalLog.apply(console, args);
};

// Restore console after a delay
setTimeout(() => {
  console.log = originalLog;
  console.log('Suspicious logs found:', suspiciousLogs.length);
  if (suspiciousLogs.length > 0) {
    console.log('⚠️ Security extensions detected:', suspiciousLogs);
  } else {
    console.log('✅ No suspicious security extensions detected');
  }
  console.log('=== DIAGNOSTIC END ===');
}, 2000);