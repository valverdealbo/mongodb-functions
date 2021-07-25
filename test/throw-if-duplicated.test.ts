import { MongoError } from 'mongodb';
import { throwIfDuplicated } from '../src/throw-if-duplicated';

describe('throwIfDuplicated()', () => {
  const ifDuplicatedError = Error('value is duplicated');

  test('should return the value when the promise resolves', async () => {
    const input = Promise.resolve(42);
    const output = await throwIfDuplicated(ifDuplicatedError, input);
    expect(output).toBe(42);
  });

  test('should throw the duplicated error when the promise reject with a MongoError with code 11000', async () => {
    const mongoError = new MongoError('duplicated value');
    mongoError.code = 11000;
    const input = Promise.reject(mongoError);
    await expect(throwIfDuplicated(ifDuplicatedError, input)).rejects.toThrow(ifDuplicatedError);
  });

  test('should rethrow any error that is not a MongoError with code 11000', async () => {
    const otherError = new Error('other error');
    const input = Promise.reject(otherError);
    await expect(throwIfDuplicated(ifDuplicatedError, input)).rejects.toThrow(otherError);
  });
});
