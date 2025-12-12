import { BookmarkClient } from '@bookmarks/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const client = new BookmarkClient({ baseUrl: API_BASE_URL });

async function captureTab(tab?: chrome.tabs.Tab) {
  if (!tab?.id || !tab.url || !tab.title) return;
  try {
    await client.create({ title: tab.title, url: tab.url });
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#10b981' });
    await chrome.action.setBadgeText({ tabId: tab.id, text: '✓' });
  } catch {
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#f97316' });
    await chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
  } finally {
    setTimeout(() => {
      chrome.action.setBadgeText({ tabId: tab.id!, text: '' });
    }, 1600);
  }
}

chrome.action.onClicked.addListener((tab) => {
  captureTab(tab);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([active]) => {
      sendResponse(active ? { title: active.title ?? '', url: active.url ?? '' } : null);
    });
    return true;
  }

  return undefined;
});
