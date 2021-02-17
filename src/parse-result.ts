/* eslint-disable @typescript-eslint/ban-types */
import omit from 'lodash/omit';
import keys from 'lodash/keys';
import { DeleteWriteOpResultObject, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';

type OptionalKeys<T> = { [K in keyof T]: {} extends Pick<T, K> ? K : never }[keyof T];

export type OmitProjection<T> = { [K in OptionalKeys<T>]?: 0 };

export async function parseResult<T>(promise: Promise<InsertOneWriteOpResult<WithId<T>>>, projection?: OmitProjection<WithId<T>>): Promise<T>;
export async function parseResult<T>(promise: Promise<InsertWriteOpResult<WithId<T>>>, projection?: OmitProjection<WithId<T>>): Promise<T[]>;
export async function parseResult<T>(promise: Promise<FindAndModifyWriteOpResultObject<T>>): Promise<T | null>;
export async function parseResult(promise: Promise<UpdateWriteOpResult>): Promise<number>;
export async function parseResult(promise: Promise<DeleteWriteOpResultObject>): Promise<number>;

export async function parseResult<T>(
  promise:
    | Promise<InsertOneWriteOpResult<WithId<T>>>
    | Promise<InsertWriteOpResult<WithId<T>>>
    | Promise<FindAndModifyWriteOpResultObject<T>>
    | Promise<UpdateWriteOpResult>
    | Promise<DeleteWriteOpResultObject>,
  projection?: OmitProjection<WithId<T>>,
): Promise<T | T[] | number | null> {
  const result = await promise;
  if ('modifiedCount' in result) {
    return result.modifiedCount;
  }
  if ('insertedId' in result) {
    if (projection === undefined) {
      return result.ops[0] as T;
    }
    return omit(result.ops[0], keys(projection)) as T;
  }
  if ('insertedIds' in result) {
    if (projection === undefined) {
      return result.ops as T[];
    }
    return result.ops.map(op => omit(op, keys(projection)) as T);
  }
  if ('result' in result) {
    return result.deletedCount as number;
  }
  return result.value ?? null;
}
