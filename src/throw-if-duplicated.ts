import { MongoError } from 'mongodb';

export async function throwIfDuplicated<T>(ifDuplicatedError: Error, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error: unknown) {
    if (error instanceof MongoError && error.code === 11000) {
      throw ifDuplicatedError;
    }
    throw error;
  }
}
