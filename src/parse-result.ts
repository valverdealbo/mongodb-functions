import { DeleteResult, InsertManyResult, InsertOneResult, ModifyResult, UpdateResult, Document } from 'mongodb';

export async function parseResult<T extends { _id: unknown }>(promise: Promise<InsertOneResult<T>>): Promise<number>;
export async function parseResult<T extends { _id: unknown }>(promise: Promise<InsertManyResult<T>>): Promise<number>;
export async function parseResult<T>(promise: Promise<ModifyResult<T>>): Promise<T | null>;
export async function parseResult(promise: Promise<UpdateResult | Document>): Promise<number>;
export async function parseResult(promise: Promise<DeleteResult>): Promise<number>;

export async function parseResult<T>(
  promise: Promise<InsertOneResult<T> | InsertManyResult<T> | ModifyResult<T> | Document | UpdateResult | DeleteResult>,
): Promise<number | T | null> {
  const result = await promise;
  if ('modifiedCount' in result) {
    return result.modifiedCount;
  }
  if ('deletedCount' in result) {
    return result.deletedCount;
  }
  if ('insertedId' in result) {
    return 1;
  }
  if ('insertedIds' in result) {
    return result.insertedCount;
  }
  return result.value ?? null;
}
