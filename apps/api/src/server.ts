import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { createBookmark, deleteBookmark, listBookmarks, searchBookmarks, updateBookmark } from './bookmark-service.js';

const app = express();
const apiRouter = express.Router();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

apiRouter.get('/bookmarks', async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const result = await listBookmarks({
      query: typeof q === 'string' ? q : undefined,
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/bookmarks/search', async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    if (typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }
    const result = await searchBookmarks(q, {
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/bookmarks', async (req, res, next) => {
  try {
    const bookmark = await createBookmark(req.body);
    res.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
});

apiRouter.put('/bookmarks/:id', async (req, res, next) => {
  try {
    const updated = await updateBookmark(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/bookmarks/:id', async (req, res, next) => {
  try {
    await deleteBookmark(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use('/api', apiRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.flatten() });
  }
  if (err instanceof Error && err.message === 'Bookmark not found') {
    return res.status(404).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
  });
}

export default app;
