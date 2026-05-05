
chrome.runtime.onInstalled.addListener(() => {
  console.log('VaultX Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_TOKEN') {
    chrome.storage.local.set({ token: message.token }, () => {
      console.log('VaultX: Token synced from web app');
    });
  }
});
