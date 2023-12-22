import { DeleteResult, InsertManyResult, InsertOneResult, UpdateResult, InferIdType } from 'mongodb';

export async function parseResult<T>(promise: Promise<InsertOneResult<T>>): Promise<InferIdType<T>>;
export async function parseResult<T>(promise: Promise<InsertManyResult<T>>): Promise<InferIdType<T>[]>;
export async function parseResult(promise: Promise<UpdateResult>): Promise<number>;
export async function parseResult(promise: Promise<DeleteResult>): Promise<number>;

export async function parseResult<T>(
  promise: Promise<InsertOneResult<T> | InsertManyResult<T> | UpdateResult | DeleteResult>,
): Promise<InferIdType<T> | InferIdType<T>[] | number> {
  const result = await promise;
  if ('insertedId' in result) {
    return result.insertedId;
  }
  if ('insertedIds' in result) {
    return Object.keys(result.insertedIds)
      .map(Number)
      .map(key => result.insertedIds[key]);
  }
  if ('deletedCount' in result) {
    return result.deletedCount;
  }
  return result.modifiedCount;
}
