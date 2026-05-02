document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const loginForm = document.getElementById('login-form');
  const credList = document.getElementById('cred-list');
  const itemsContainer = document.getElementById('items-container');
  const openVaultBtn = document.getElementById('open-vault');

  openVaultBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  try {
    // 1. Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // 2. Check if logged in (fetch token from storage)
    const { token } = await chrome.storage.local.get('token');
    
    if (!token) {
      loading.style.display = 'none';
      loginForm.style.display = 'block';
      return;
    }

    // 3. Fetch matching credentials from API
    const response = await fetch(`http://localhost:5000/api/credentials/by-url?url=${encodeURIComponent(tab.url)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    loading.style.display = 'none';
    
    if (data.success && data.credentials.length > 0) {
      credList.style.display = 'block';
      itemsContainer.innerHTML = '';
      
      data.credentials.forEach(cred => {
        const div = document.createElement('div');
        div.className = 'cred-card';

        const name = document.createElement('div');
        name.className = 'cred-name';
        name.textContent = cred.siteName;

        const username = document.createElement('div');
        username.className = 'cred-user';
        username.textContent = cred.username;

        div.append(name, username);
        div.addEventListener('click', () => {
          autofill(cred.username, cred.password);
        });
        itemsContainer.appendChild(div);
      });
    } else {
      loading.style.display = 'block';
      loading.textContent = 'No matching credentials found for this site.';
    }
  } catch (err) {
    loading.style.display = 'block';
    loading.textContent = 'Error connecting to VaultX API.';
    console.error(err);
  }
});

async function autofill(username, password) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (u, p) => {
      // Very basic autofill logic
      const userField = document.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]');
      const passField = document.querySelector('input[type="password"]');
      
      if (userField) {
        userField.value = u;
        userField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passField) {
        passField.value = p;
        passField.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    args: [username, password]
  });
  
  window.close(); // Close popup after clicking
}
