import { DeleteResult, InsertManyResult, InsertOneResult, ModifyResult, UpdateResult, Document, InferIdType } from 'mongodb';

export async function parseResult<T>(promise: Promise<InsertOneResult<T>>): Promise<InferIdType<T>>;
export async function parseResult<T>(promise: Promise<InsertManyResult<T>>): Promise<InferIdType<T>[]>;
export async function parseResult<T>(promise: Promise<ModifyResult<T>>): Promise<T | null>;
export async function parseResult(promise: Promise<UpdateResult | Document>): Promise<number>;
export async function parseResult(promise: Promise<DeleteResult>): Promise<number>;

export async function parseResult<T>(
  promise: Promise<InsertOneResult<T> | InsertManyResult<T> | ModifyResult<T> | Document | UpdateResult | DeleteResult>,
): Promise<InferIdType<T> | InferIdType<T>[] | number | T | null> {
  const result = await promise;
  if ('modifiedCount' in result) {
    return result.modifiedCount;
  }
  if ('deletedCount' in result) {
    return result.deletedCount;
  }
  if ('insertedId' in result) {
    return result.insertedId;
  }
  if ('insertedIds' in result) {
    return Object.keys(result.insertedIds).map(key => result.insertedIds[key]);
  }
  return result.value ?? null;
}
