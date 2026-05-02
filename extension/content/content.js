/**
 * VaultX Content Script
 * Detects login forms and handles communication with the web app for token sync.
 */

console.log('VaultX: Content script loaded');

// If we are on the VaultX dashboard, we can capture the token and sync it to extension storage
if (window.location.origin === 'http://localhost:3000') {
  const syncToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token });
    }
  };

  // Sync on load and periodically or on storage change
  syncToken();
  window.addEventListener('storage', syncToken);
}

// Basic form detection (future: inject autofill buttons)
const detectForms = () => {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length > 0) {
    console.log('VaultX: Login form detected');
    // Here we could inject a small VaultX icon into the input fields
  }
};

detectForms();
// Re-detect on DOM changes
const observer = new MutationObserver(detectForms);
observer.observe(document.body, { childList: true, subtree: true });
