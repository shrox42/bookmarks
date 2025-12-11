import { z } from 'zod';

export const bookmarkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  url: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createBookmarkSchema = bookmarkSchema.pick({ title: true, url: true });

export const updateBookmarkSchema = createBookmarkSchema
  .partial()
  .refine((values) => Object.values(values).some(Boolean), {
    message: 'Provide at least one field to update.',
  });

export type Bookmark = z.infer<typeof bookmarkSchema>;

export type CreateBookmarkPayload = z.infer<typeof createBookmarkSchema>;

export type UpdateBookmarkPayload = z.infer<typeof updateBookmarkSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function getDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export * from './client.js';
