let cached: { client: import('mongodb').MongoClient; db: import('mongodb').Db } | null = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (cached) return cached.db;
  const mod = (await import('mongodb').catch(() => null)) as typeof import('mongodb') | null;
  if (!mod) throw new Error('mongodb driver not installed');
  const client = new mod.MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB || 'flywheel';
  const db = client.db(dbName);
  cached = { client, db };
  return db;
}


