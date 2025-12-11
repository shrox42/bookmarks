import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Bookmark } from '@shared/index.js';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const DEFAULT_DB_PATH = path.join(DATA_DIR, 'bookmarks.db');

let client: Client | null = null;
let dbPromise: Promise<LibSQLDatabase<typeof schema>> | null = null;

export type BookmarkRow = typeof schema.bookmarks.$inferSelect;

function ensureDirectoryFor(filePath: string | null) {
  if (!filePath) return;
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function resolveDatabaseUrl() {
  const target = process.env.DATABASE_URL ?? DEFAULT_DB_PATH;
  if (target === ':memory:') {
    return { url: 'file::memory:?cache=shared', filePath: null };
  }
  if (target.startsWith('libsql:') || target.startsWith('http://') || target.startsWith('https://')) {
    return { url: target, filePath: null };
  }
  if (target.startsWith('file:')) {
    const filePath = target.replace(/^file:/, '');
    ensureDirectoryFor(filePath);
    return { url: `file:${filePath}`, filePath };
  }
  const absolutePath = path.isAbsolute(target) ? target : path.join(DATA_DIR, target);
  ensureDirectoryFor(absolutePath);
  return { url: `file:${absolutePath}`, filePath: absolutePath };
}

async function migrate(currentClient: Client) {
  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await currentClient.execute(`CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks (title);`);
  await currentClient.execute(`CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks (url);`);
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { url } = resolveDatabaseUrl();
      client = createClient({ url });
      await migrate(client);
      return drizzle(client, { schema });
    })();
  }
  return dbPromise;
}

export async function resetDbForTests() {
  if (process.env.NODE_ENV !== 'test') return;
  const db = await getDb();
  await db.delete(schema.bookmarks);
}

export function mapRowToBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
