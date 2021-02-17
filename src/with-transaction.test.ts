/* eslint-disable import/no-extraneous-dependencies */
import { MongoClient, ObjectId, Collection } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { withTransaction } from './with-transaction';

interface Doc {
  _id: ObjectId;
  name: string;
  age: number;
  birth?: string;
  tag?: string;
}

const doc1: Doc = { _id: new ObjectId(), name: 'one', age: 25 };
const doc2: Doc = { _id: new ObjectId(), name: 'two', age: 45 };
const duplicatedDoc: Doc = { _id: doc1._id, name: 'one', age: 25 };

describe('withTransaction()', () => {
  let server: MongoMemoryReplSet;
  let client: MongoClient;
  let collection: Collection<Doc>;

  beforeAll(async () => {
    server = new MongoMemoryReplSet({ replSet: { storageEngine: 'wiredTiger' }, binary: { version: '4.4.3' } });
    await server.waitUntilRunning();
    const uri = await server.getUri();
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const dbName = await server.getDbName();
    collection = client.db(dbName).collection('docs');
  });

  beforeEach(async () => {
    await collection.deleteMany({});
  });

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  test('should commit a transaction', async () => {
    const inserted = await withTransaction(client, async session => {
      await collection.insertOne(doc1, { session });
      const result = await collection.insertOne(doc2, { session });
      return result.ops[0];
    });
    expect(inserted.name).toBe(doc2.name);
    const found = await collection.find().toArray();
    expect(found).toHaveLength(2);
  });

  test('should abort a transaction', async () => {
    try {
      await withTransaction(client, async session => {
        await collection.insertOne(doc1, { session });
        const result = await collection.insertOne(duplicatedDoc, { session });
        return result.ops[0];
      });
    } catch (error) {
      expect(error.code).toBe(11000);
      const found = await collection.find().toArray();
      expect(found).toHaveLength(0);
    }
  });
});
