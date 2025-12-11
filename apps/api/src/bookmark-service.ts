import { randomUUID } from 'node:crypto';
import Fuse from 'fuse.js';
import { desc, eq, like, or, sql } from 'drizzle-orm';
import type { Bookmark, CreateBookmarkPayload, PaginatedResult, UpdateBookmarkPayload } from '@shared/index.js';
import { createBookmarkSchema, updateBookmarkSchema } from '@shared/index.js';
import { getDb, mapRowToBookmark, type BookmarkRow } from './db.js';
import { bookmarks } from './schema.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface ListParams {
  page?: number;
  limit?: number;
  query?: string;
}

function normalizePagination(params?: ListParams) {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit ? Math.min(Math.max(params.limit, 1), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildSearchCondition(query?: string) {
  if (!query) return undefined;
  const likeQuery = `%${query}%`;
  return or(like(bookmarks.title, likeQuery), like(bookmarks.url, likeQuery));
}

export async function listBookmarks(params?: ListParams): Promise<PaginatedResult<Bookmark>> {
  const db = await getDb();
  const whereClause = buildSearchCondition(params?.query);
  const { limit, offset } = normalizePagination(params);

  let rowsQuery = db.select().from(bookmarks);
  if (whereClause) {
    rowsQuery = rowsQuery.where(whereClause);
  }
  rowsQuery = rowsQuery.orderBy(desc(bookmarks.updatedAt)).limit(limit).offset(offset);
  const rows = (await rowsQuery) as BookmarkRow[];

  let countQuery = db.select({ total: sql<number>`count(*)` }).from(bookmarks);
  if (whereClause) {
    countQuery = countQuery.where(whereClause);
  }
  const [{ total }] = await countQuery;

  return {
    items: rows.map(mapRowToBookmark),
    total,
  };
}

export async function searchBookmarks(query: string, params?: Omit<ListParams, 'query'>): Promise<PaginatedResult<Bookmark>> {
  const baseResults = await listBookmarks({ ...params, query });
  if (baseResults.items.length > 0 || !query) {
    return baseResults;
  }

  const db = await getDb();
  const rows = (await db.select().from(bookmarks).orderBy(desc(bookmarks.updatedAt))) as BookmarkRow[];
  const fuse = new Fuse(rows, {
    keys: ['title', 'url'],
    threshold: 0.4,
  });
  const { limit } = normalizePagination(params);
  const results = fuse.search(query, { limit }).map((result) => mapRowToBookmark(result.item));

  return { items: results, total: results.length };
}

export async function createBookmark(payload: CreateBookmarkPayload): Promise<Bookmark> {
  const parsed = createBookmarkSchema.parse(payload);
  const now = new Date().toISOString();
  const db = await getDb();
  const values = {
    id: randomUUID(),
    title: parsed.title,
    url: parsed.url,
    createdAt: now,
    updatedAt: now,
  };

  const [row] = (await db
    .insert(bookmarks)
    .values(values)
    .onConflictDoUpdate({
      target: bookmarks.url,
      set: {
        title: values.title,
        updatedAt: values.updatedAt,
      },
    })
    .returning()) as BookmarkRow[];

  return mapRowToBookmark(row);
}

export async function updateBookmark(id: string, payload: UpdateBookmarkPayload): Promise<Bookmark> {
  const parsed = updateBookmarkSchema.parse(payload);
  const now = new Date().toISOString();
  const db = await getDb();

  const updates: Partial<typeof bookmarks.$inferInsert> = { updatedAt: now };
  if (parsed.title) {
    updates.title = parsed.title;
  }
  if (parsed.url) {
    updates.url = parsed.url;
  }

  const [row] = (await db
    .update(bookmarks)
    .set(updates)
    .where(eq(bookmarks.id, id))
    .returning()) as (BookmarkRow | undefined)[];

  if (!row) {
    throw new Error('Bookmark not found');
  }

  return mapRowToBookmark(row);
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDb();
  const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
  if (result.rowsAffected === 0) {
    throw new Error('Bookmark not found');
  }
}
