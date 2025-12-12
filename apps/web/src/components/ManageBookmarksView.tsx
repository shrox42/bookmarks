import type { Bookmark, UpdateBookmarkPayload } from '@bookmarks/shared';
import { Button, Surface } from '@bookmarks/shared/ui';
import { PenSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './Dialog.tsx';
import { Input } from '@bookmarks/shared/ui';
import { getDisplayUrl } from '@bookmarks/shared';

interface ManageBookmarksViewProps {
  bookmarks: Bookmark[];
  onUpdate: (id: string, payload: UpdateBookmarkPayload) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  updatingId?: string;
  deletingId?: string;
}

export function ManageBookmarksView({ bookmarks, onUpdate, onDelete, updatingId, deletingId }: ManageBookmarksViewProps) {
  return (
    <Surface className="mx-auto w-full max-w-4xl space-y-6 border-white/15 bg-white/5 px-10 py-10">
      <div className="space-y-3 border-b border-white/10 pb-4">
        <h2 className="font-display text-3xl font-semibold">Manage Bookmarks</h2>
        <p className="text-white/60">Edit titles, fix URLs, or clean up entries you no longer need.</p>
      </div>
      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <p className="text-white/40">No bookmarks yet.</p>
        ) : (
          bookmarks.map((bookmark) => (
            <Row
              key={bookmark.id}
              bookmark={bookmark}
              onUpdate={onUpdate}
              onDelete={onDelete}
              updating={updatingId === bookmark.id}
              deleting={deletingId === bookmark.id}
            />
          ))
        )}
      </div>
    </Surface>
  );
}

function Row({
  bookmark,
  onUpdate,
  onDelete,
  updating,
  deleting,
}: {
  bookmark: Bookmark;
  onUpdate: (id: string, payload: UpdateBookmarkPayload) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  updating: boolean;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <div>
        <p className="font-display text-lg">{bookmark.title}</p>
        <p className="text-sm text-white/50">{getDisplayUrl(bookmark.url)}</p>
      </div>
      <div className="flex gap-2">
        <EditDialog bookmark={bookmark} onUpdate={onUpdate} isSubmitting={updating} />
        <DeleteDialog bookmark={bookmark} onDelete={onDelete} isDeleting={deleting} />
      </div>
    </div>
  );
}

function EditDialog({
  bookmark,
  onUpdate,
  isSubmitting,
}: {
  bookmark: Bookmark;
  onUpdate: (id: string, payload: UpdateBookmarkPayload) => Promise<void> | void;
  isSubmitting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({ title: bookmark.title, url: bookmark.url });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdate(bookmark.id, formValues);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <PenSquare className="h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent title="Edit Bookmark" description="Update the title or URL.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formValues.title}
            onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
          />
          <Input
            label="URL"
            type="url"
            value={formValues.url}
            onChange={(event) => setFormValues((prev) => ({ ...prev, url: event.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  bookmark,
  onDelete,
  isDeleting,
}: {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void> | void;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(bookmark.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent title="Delete Bookmark" description={`Remove "${bookmark.title}" from your list?`}>
        <p className="text-sm text-white/60">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
