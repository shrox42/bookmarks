import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBookmarkPayload, UpdateBookmarkPayload } from '@bookmarks/shared';
import { BookmarkClient } from '@bookmarks/shared';
import { useMemo, useState } from 'react';
import { AddBookmarkView } from './components/AddBookmarkView.tsx';
import { Layout, type View } from './components/Layout.tsx';
import { ManageBookmarksView } from './components/ManageBookmarksView.tsx';
import { SearchView } from './components/SearchView.tsx';
import { ToastProvider, useToast } from './components/Toast.tsx';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const client = new BookmarkClient({ baseUrl: API_BASE_URL });

export default function App() {
  return (
    <ToastProvider>
      <BookmarksApp />
    </ToastProvider>
  );
}

function BookmarksApp() {
  const [view, setView] = useState<View>('search');
  const queryClient = useQueryClient();
  const { push } = useToast();

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => client.list({ limit: 200 }),
  });

  const bookmarks = useMemo(() => bookmarksQuery.data?.items ?? [], [bookmarksQuery.data]);

  const invalidateBookmarks = () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateBookmarkPayload) => client.create(payload),
    onSuccess: () => {
      invalidateBookmarks();
      push({ title: 'Bookmark saved', description: 'Check the search view to find it instantly.' });
      setView('search');
    },
    onError: () => {
      push({ title: 'Unable to save bookmark', description: 'Please try again.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBookmarkPayload }) => client.update(id, payload),
    onSuccess: () => {
      invalidateBookmarks();
      push({ title: 'Bookmark updated' });
    },
    onError: () => push({ title: 'Update failed', description: 'Double-check the URL and try again.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.remove(id),
    onSuccess: () => {
      invalidateBookmarks();
      push({ title: 'Bookmark removed' });
    },
    onError: () => push({ title: 'Delete failed', description: 'Try again in a moment.' }),
  });

  return (
    <Layout view={view} onNavigate={setView}>
      {bookmarksQuery.isError ? (
        <p className="rounded-3xl border border-rose-400/50 bg-rose-500/10 px-6 py-4 text-rose-200">
          Could not load bookmarks. Ensure the Docker stack is running on http://localhost:14747.
        </p>
      ) : null}
      {view === 'search' ? (
        <SearchView bookmarks={bookmarks} isLoading={bookmarksQuery.isLoading} />
      ) : null}
      {view === 'add' ? (
        <AddBookmarkView
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
          onCancel={() => setView('search')}
          isSubmitting={createMutation.isPending}
        />
      ) : null}
      {view === 'manage' ? (
        <ManageBookmarksView
          bookmarks={bookmarks}
          onUpdate={async (id, payload) => {
            await updateMutation.mutateAsync({ id, payload });
          }}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
          }}
          updatingId={updateMutation.variables?.id}
          deletingId={deleteMutation.variables}
        />
      ) : null}
    </Layout>
  );
}
