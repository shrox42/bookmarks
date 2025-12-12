import type { CreateBookmarkPayload } from '@bookmarks/shared';
import { createBookmarkSchema } from '@bookmarks/shared';
import { Input } from '@bookmarks/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface AddBookmarkViewProps {
  onSubmit: (payload: CreateBookmarkPayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
}

type FormValues = z.infer<typeof createBookmarkSchema>;

export function AddBookmarkView({ onSubmit, onCancel, isSubmitting }: AddBookmarkViewProps) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createBookmarkSchema),
    defaultValues: { title: '', url: '' },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="space-y-4 border-b border-white/10 pb-6">
        <h2 className="font-display text-4xl font-semibold tracking-tight">Add New Bookmark</h2>
      </div>
      <form onSubmit={submit} className="mt-10 space-y-7">
        <Input
          label="Title"
          placeholder="e.g., My Favorite Documentation"
          {...register('title')}
          error={errors.title?.message}
        />
        <Input label="URL" placeholder="https://..." type="url" {...register('url')} error={errors.url?.message} />
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex flex-1 min-w-[140px] items-center justify-center rounded-xl border border-white/25 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex flex-1 min-w-[180px] items-center justify-center rounded-xl bg-white/80 px-8 py-3 text-base font-semibold text-slate-900 transition hover:bg-white disabled:pointer-events-none disabled:opacity-60 sm:flex-none"
          >
            {isSubmitting ? 'Saving…' : 'Save Bookmark'}
          </button>
        </div>
      </form>
    </div>
  );
}
