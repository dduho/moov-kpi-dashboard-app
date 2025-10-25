// Debug script for navigation issues
// Copy and paste this into the browser console at http://localhost:5173

console.log('=== NAVIGATION DEBUG ===');

// Check Vue Router
if (window.Vue && window.Vue.router) {
  console.log('✅ Vue Router available');
  console.log('Current route:', window.Vue.router.currentRoute.value);
} else {
  console.log('❌ Vue Router not found');
}

// Check if we can manually navigate
if (typeof window !== 'undefined' && window.location) {
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
}

// Test manual navigation
setTimeout(() => {
  console.log('Testing manual navigation to dashboard...');
  try {
    // Try window.location
    // window.location.href = '/#/'; // This would cause a page reload

    // Try history API
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/#/');
      console.log('✅ History.pushState worked');
      console.log('New pathname:', window.location.pathname);
    } else {
      console.log('❌ History API not available');
    }
  } catch (e) {
    console.error('❌ Manual navigation failed:', e);
  }
}, 1000);

// Check for Vue app instance
if (window.Vue && window.Vue.app) {
  console.log('✅ Vue app instance found');
} else {
  console.log('❌ Vue app instance not found');
}

console.log('=== END DEBUG ===');