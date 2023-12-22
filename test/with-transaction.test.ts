import { MongoClient, ObjectId, Collection } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { withTransaction, Transaction } from '../src/with-transaction';

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
    server = await MongoMemoryReplSet.create({ replSet: { storageEngine: 'wiredTiger' }, binary: { version: '6.0.12' } });
    client = await MongoClient.connect(server.getUri());
    collection = client.db(server.replSetOpts.dbName).collection('docs');
  });

  beforeEach(async () => {
    await collection.deleteMany({});
  });

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  test('should commit a transaction', async () => {
    await withTransaction(client, async session => {
      await collection.insertOne(doc1, { session });
      await collection.insertOne(doc2, { session });
    });
    const found = await collection.find().toArray();
    expect(found).toHaveLength(2);
  });

  test('should abort a transaction', async () => {
    const transaction: Transaction<void> = async session => {
      await collection.insertOne(doc1, { session });
      await collection.insertOne(duplicatedDoc, { session });
    };
    await expect(withTransaction(client, transaction)).rejects.toMatchObject({ code: 11000 });
    const found = await collection.find().toArray();
    expect(found).toHaveLength(0);
  });
});
