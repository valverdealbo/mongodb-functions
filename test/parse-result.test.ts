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
    server = await MongoMemoryReplSet.create({ replSet: { storageEngine: 'wiredTiger' }, binary: { version: '4.4.5' } });
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
    const insertedCount = await parseResult(collection.insertOne(doc1));
    expect(insertedCount).toEqual(1);
  });

  test('should parse the result of insertMany', async () => {
    const insertedCount = await parseResult(collection.insertMany([doc1, doc2]));
    expect(insertedCount).toEqual(2);
  });

  test('should return the document when findOneAndUpdate finds it', async () => {
    await collection.insertOne(doc1);
    const updated = await parseResult(collection.findOneAndUpdate({ _id: doc1._id }, { $set: { name: 'updated' } }, { returnDocument: 'after' }));
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
