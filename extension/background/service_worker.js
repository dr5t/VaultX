/**
 * VaultX Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('VaultX Extension installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_TOKEN') {
    chrome.storage.local.set({ token: message.token }, () => {
      console.log('VaultX: Token synced from web app');
    });
  }
});
