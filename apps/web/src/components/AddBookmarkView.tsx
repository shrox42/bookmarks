import type { CreateBookmarkPayload } from '@shared/index.js';
import { createBookmarkSchema } from '@shared/index.js';
import { Button, Input, Surface } from '@shared/ui';
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
    <Surface className="mx-auto w-full max-w-3xl space-y-6 border-white/15 bg-white/5 px-10 py-10">
      <div className="space-y-3 border-b border-white/10 pb-4">
        <h2 className="font-display text-3xl font-semibold">Add New Bookmark</h2>
        <p className="text-white/60">Store documentation, blog posts, or anything worth revisiting.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Title"
          placeholder="e.g., My Favorite Documentation"
          {...register('title')}
          error={errors.title?.message}
        />
        <Input label="URL" placeholder="https://..." type="url" {...register('url')} error={errors.url?.message} />
        <div className="flex flex-wrap justify-between gap-3 pt-4">
          <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Bookmark'}
          </Button>
        </div>
      </form>
    </Surface>
  );
}
