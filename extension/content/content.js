
console.log('VaultX: Content script loaded');

if (window.location.origin === 'http://localhost:3000') {
  const syncToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      chrome.runtime.sendMessage({ type: 'SYNC_TOKEN', token });
    }
  };

  syncToken();
  window.addEventListener('storage', syncToken);
}

const detectForms = () => {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length > 0) {
    console.log('VaultX: Login form detected');
  }
};

detectForms();
const observer = new MutationObserver(detectForms);
observer.observe(document.body, { childList: true, subtree: true });
