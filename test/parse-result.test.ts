import { MongoClient, ObjectId, Collection } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { parseResult } from '../src/parse-result';

interface Doc {
  _id: ObjectId;
  name: string;
  age: number;
  friends?: number;
  tag?: string;
}

const doc1: Doc = { _id: new ObjectId(), name: 'one', age: 25, friends: 1, tag: 'one' };
const doc2: Doc = { _id: new ObjectId(), name: 'two', age: 45, friends: 2, tag: 'two' };

describe('parseResult()', () => {
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

  test('should parse the result of insertOne', async () => {
    const insertedId = await parseResult(collection.insertOne(doc1));
    expect(insertedId).toBe(doc1._id);
  });

  test('should parse the result of insertMany', async () => {
    const insertedIds = await parseResult(collection.insertMany([doc1, doc2]));
    expect(insertedIds).toEqual([doc1._id, doc2._id]);
  });

  test('should parse the result of updateMany', async () => {
    await collection.insertMany([doc1, doc2]);
    const updatedCount = await parseResult(collection.updateMany({}, { $set: { updated: true } }));
    expect(updatedCount).toBe(2);
  });

  test('should parse the result of deleteMany', async () => {
    await collection.insertMany([doc1, doc2]);
    const deletedCount = await parseResult(collection.deleteMany({}));
    expect(deletedCount).toBe(2);
  });
});
