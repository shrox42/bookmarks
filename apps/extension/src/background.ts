import { BookmarkClient } from '@bookmarks/shared';

function normalizeUrl(url?: string | null) {
  return (url ?? '').replace(/\/$/, '');
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:14747/api').replace(/\/$/, '');
const WEB_CLIENT_URL = normalizeUrl(
  import.meta.env.VITE_WEB_URL ?? import.meta.env.VITE_WEB_APP_URL ?? 'http://localhost:14747/',
);
const ENABLE_NEW_TAB_REDIRECT =
  (import.meta.env.VITE_ENABLE_NEW_TAB_REDIRECT ?? 'true').toLowerCase() !== 'false';

const client = new BookmarkClient({ baseUrl: API_BASE_URL });
const redirectingTabs = new Set<number>();

const NEW_TAB_URLS = new Set(
  [
    'chrome://newtab/',
    'chrome://new-tab-page',
    'chrome://newtab',
    'chrome-search://local-ntp/local-ntp.html',
    'edge://newtab/',
    'about:blank',
  ].map((url) => normalizeUrl(url)),
);

const isNewTabUrl = (url?: string | null) => {
  const normalized = normalizeUrl(url);
  if (!normalized) return true;
  if (normalized.startsWith('chrome-search://local-ntp')) return true;
  return NEW_TAB_URLS.has(normalized);
};

function shouldRedirect(tab: chrome.tabs.Tab) {
  const target = tab.pendingUrl ?? tab.url;
  return isNewTabUrl(target);
}

function handleNewTab(tab: chrome.tabs.Tab) {
  if (!tab.id || redirectingTabs.has(tab.id) || !shouldRedirect(tab)) {
    return;
  }
  redirectingTabs.add(tab.id);
  chrome.tabs.update(tab.id, { url: WEB_CLIENT_URL }, () => {
    if (chrome.runtime.lastError) {
      redirectingTabs.delete(tab.id);
    }
  });
}

if (ENABLE_NEW_TAB_REDIRECT) {
  chrome.tabs.onCreated.addListener(handleNewTab);

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!redirectingTabs.has(tabId)) return;
    const updatedUrl = normalizeUrl(changeInfo.url ?? tab.url ?? '');
    if (updatedUrl === WEB_CLIENT_URL) {
      redirectingTabs.delete(tabId);
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    redirectingTabs.delete(tabId);
  });
}

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
