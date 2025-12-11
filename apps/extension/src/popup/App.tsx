import { useEffect, useState } from 'react';
import { Button, Input, Surface } from '@shared/ui';
import { BookmarkClient } from '@shared/index.js';

interface ActiveTabInfo {
  title: string;
  url: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const client = new BookmarkClient({ baseUrl: API_BASE_URL });

export function App() {
  const [form, setForm] = useState<ActiveTabInfo>({ title: '', url: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB' }, (response: ActiveTabInfo | null) => {
      if (response) {
        setForm(response);
      }
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.url) return;
    setStatus('saving');
    try {
      await client.create(form);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-w-[320px] bg-[#05070d] p-4 text-white">
      <Surface className="space-y-4 bg-white/10 shadow-lg">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Quick Add</p>
          <h1 className="font-display text-xl font-semibold">Bookmark Dropper</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <Input
            label="URL"
            type="url"
            value={form.url}
            onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
          />
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save Bookmark'}
          </Button>
          {status === 'success' ? <p className="text-sm text-emerald-300">Saved!</p> : null}
          {status === 'error' ? <p className="text-sm text-rose-300">Unable to save. Try again.</p> : null}
        </form>
      </Surface>
    </main>
  );
}
