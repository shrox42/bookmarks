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
    <Surface spotlight className="space-y-6">
      <div>
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
        <div className="flex flex-wrap justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Bookmark'}
          </Button>
        </div>
      </form>
    </Surface>
  );
}
