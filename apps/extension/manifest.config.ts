import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Bookmark Dropper',
  description: 'Quickly capture the current tab as a bookmark.',
  version: pkg.version,
  action: {
    default_popup: 'popup.html',
  },
  permissions: ['tabs'],
  host_permissions: ['http://localhost:14747/*'],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
}));
