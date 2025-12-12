import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Bookmark Dropper',
  description: 'Quickly capture the current tab as a bookmark.',
  version: '0.1.0',
  action: {
    default_popup: 'popup.html',
  },
  permissions: ['tabs'],
  host_permissions: ['http://localhost:47474/*'],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
}));
