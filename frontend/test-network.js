// Test script to check if security extensions are interfering with network requests
// Run this in the browser console on the login page

console.log('Testing network connectivity...');

// Test basic fetch request
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'p@ssw0rd'
  })
})
.then(response => {
  console.log('Fetch response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Fetch response data:', data);
})
.catch(error => {
  console.error('Fetch error:', error);
});

// Test XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:8000/api/auth/login');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  console.log('XHR response status:', xhr.status);
  console.log('XHR response text:', xhr.responseText);
};
xhr.onerror = function() {
  console.error('XHR error occurred');
};
xhr.send(JSON.stringify({
  username: 'admin',
  password: 'p@ssw0rd'
}));

// Test if Vue reactivity is working
console.log('Testing Vue reactivity...');
if (typeof window !== 'undefined' && window.Vue) {
  console.log('Vue is available');
} else {
  console.log('Vue not found in global scope');
}