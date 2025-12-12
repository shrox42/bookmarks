import type { Bookmark, CreateBookmarkPayload, PaginatedResult, UpdateBookmarkPayload } from './index.js';

export interface BookmarkClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

type ListParams = { query?: string; page?: number; limit?: number };

export class BookmarkClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: BookmarkClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');

    if (options.fetchImpl) {
      this.fetchImpl = options.fetchImpl;
    } else if (typeof globalThis.fetch === 'function') {
      // Bind to the global context so browsers don't treat it as an illegal invocation.
      this.fetchImpl = globalThis.fetch.bind(globalThis);
    } else {
      throw new Error('BookmarkClient requires a fetch implementation.');
    }
  }

  private async request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(input, init);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || response.statusText);
    }
    return response.json() as Promise<T>;
  }

  private buildListUrl(path: string, params?: ListParams) {
    const url = new URLSearchParams();
    if (params?.query) url.set('q', params.query);
    if (params?.page) url.set('page', String(params.page));
    if (params?.limit) url.set('limit', String(params.limit));
    const queryString = url.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  async list(params?: ListParams): Promise<PaginatedResult<Bookmark>> {
    const endpoint = this.buildListUrl(`${this.baseUrl}/bookmarks`, params);
    return this.request(endpoint);
  }

  async search(params: ListParams & { query: string }): Promise<PaginatedResult<Bookmark>> {
    const endpoint = this.buildListUrl(`${this.baseUrl}/bookmarks/search`, params);
    return this.request(endpoint);
  }

  async create(payload: CreateBookmarkPayload): Promise<Bookmark> {
    return this.request(`${this.baseUrl}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async update(id: string, payload: UpdateBookmarkPayload): Promise<Bookmark> {
    return this.request(`${this.baseUrl}/bookmarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async remove(id: string): Promise<{ success: true }> {
    return this.request(`${this.baseUrl}/bookmarks/${id}`, { method: 'DELETE' });
  }
}
