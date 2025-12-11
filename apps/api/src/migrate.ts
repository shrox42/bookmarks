import { getDb } from './db.js';

// Running getDb() ensures the schema exists when invoked manually.
await getDb();
console.log('Database ready.');
