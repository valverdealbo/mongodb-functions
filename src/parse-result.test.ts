/* eslint-disable import/no-extraneous-dependencies */
import { MongoClient, ObjectId, Collection } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { parseResult } from './parse-result';

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

  test('should parse the result of insertOne', async () => {
    const inserted = await parseResult(collection.insertOne(doc1));
    expect(inserted).toEqual(doc1);
  });

  test('should omit the projection keys on insertOne', async () => {
    const inserted = await parseResult(collection.insertOne(doc1), { tag: 0, friends: 0 });
    expect(inserted).toEqual({
      _id: doc1._id,
      name: doc1.name,
      age: doc1.age,
    });
  });

  test('should parse the result of insertMany', async () => {
    const inserted = await parseResult(collection.insertMany([doc1, doc2]));
    expect(inserted).toEqual([doc1, doc2]);
  });

  test('should omit the projection keys on insertMany', async () => {
    const inserted = await parseResult(collection.insertMany([doc1, doc2]), { tag: 0, friends: 0 });
    expect(inserted).toEqual([
      {
        _id: doc1._id,
        name: doc1.name,
        age: doc1.age,
      },
      {
        _id: doc2._id,
        name: doc2.name,
        age: doc2.age,
      },
    ]);
  });

  test('should return the document when findOneAndUpdate finds it', async () => {
    await collection.insertOne(doc1);
    const updated = await parseResult(collection.findOneAndUpdate({ _id: doc1._id }, { $set: { name: 'updated' } }, { returnOriginal: false }));
    expect(updated).toEqual({ ...doc1, name: 'updated' });
  });

  test('should return null when findOneAndUpdate does not find the document', async () => {
    const updated = await parseResult(collection.findOneAndUpdate({ _id: doc1._id }, { $set: { name: 'updated' } }));
    expect(updated).toBeNull();
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
