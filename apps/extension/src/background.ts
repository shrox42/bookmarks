import { BookmarkClient } from '@bookmarks/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:47474/api').replace(/\/$/, '');
const ENABLE_NEW_TAB_REDIRECT = import.meta.env.VITE_ENABLE_NEW_TAB_REDIRECT !== 'false';
const WEB_APP_URL = (import.meta.env.VITE_WEB_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const NEW_TAB_REDIRECT_URL = `${WEB_APP_URL}/`;
const client = new BookmarkClient({ baseUrl: API_BASE_URL });

const NEW_TAB_URLS = new Set([
  'chrome://newtab/',
  'chrome://new-tab-page',
  'chrome://newtab',
  'chrome-search://local-ntp/local-ntp.html',
  'edge://newtab/',
  'about:blank',
]);

const isNewTabUrl = (url: string) => NEW_TAB_URLS.has(url) || url.startsWith('chrome-search://local-ntp');

const shouldRedirectNewTab = (tab: chrome.tabs.Tab) => {
  if (!ENABLE_NEW_TAB_REDIRECT || !tab.id) return false;
  const target = tab.pendingUrl ?? tab.url;

  if (!target) return false;

  if (target === NEW_TAB_REDIRECT_URL) return false;

  return isNewTabUrl(target);
};

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

if (ENABLE_NEW_TAB_REDIRECT) {
  chrome.tabs.onCreated.addListener((tab) => {
    if (!shouldRedirectNewTab(tab)) return;

    chrome.tabs.update(tab.id!, { url: NEW_TAB_REDIRECT_URL });
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([active]) => {
      sendResponse(active ? { title: active.title ?? '', url: active.url ?? '' } : null);
    });
    return true;
  }

  return undefined;
});
