process.env.DATABASE_URL = ':memory:';

import request from 'supertest';
import app from './server.js';
import { resetDbForTests } from './db.js';

describe('bookmarks api', () => {
  beforeEach(async () => {
    await resetDbForTests();
  });

  it('creates and upserts bookmarks', async () => {
    const payload = { title: 'Example', url: 'https://example.com' };

    const createResponse = await request(app).post('/bookmarks').send(payload).expect(201);
    expect(createResponse.body.title).toBe(payload.title);

    const upsertResponse = await request(app)
      .post('/bookmarks')
      .send({ ...payload, title: 'Updated' })
      .expect(201);
    expect(upsertResponse.body.title).toBe('Updated');
  });

  it('paginates and searches bookmarks', async () => {
    const payloads = Array.from({ length: 5 }, (_, idx) => ({
      title: `Bookmark ${idx}`,
      url: `https://example.com/${idx}`,
    }));

    await Promise.all(payloads.map((payload) => request(app).post('/bookmarks').send(payload)));

    const listResponse = await request(app).get('/bookmarks?page=1&limit=2').expect(200);
    expect(listResponse.body.items).toHaveLength(2);
    expect(listResponse.body.total).toBe(payloads.length);

    const searchResponse = await request(app).get('/bookmarks/search?q=Bookmark 1').expect(200);
    expect(searchResponse.body.items[0].title).toContain('Bookmark');
  });

  it('updates and deletes bookmarks', async () => {
    const payload = { title: 'Temp', url: 'https://temp.dev' };
    const created = await request(app).post('/bookmarks').send(payload).expect(201);

    await request(app).put(`/bookmarks/${created.body.id}`).send({ title: 'Renamed' }).expect(200);
    const updated = await request(app).get('/bookmarks').expect(200);
    expect(updated.body.items[0].title).toBe('Renamed');

    await request(app).delete(`/bookmarks/${created.body.id}`).expect(200);
    const afterDelete = await request(app).get('/bookmarks').expect(200);
    expect(afterDelete.body.items).toHaveLength(0);
  });
});
