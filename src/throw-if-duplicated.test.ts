import { MongoError } from 'mongodb';
import { throwIfDuplicated } from './throw-if-duplicated';

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
    expect.assertions(1);
    try {
      const input = Promise.reject(mongoError);
      await throwIfDuplicated(ifDuplicatedError, input);
    } catch (error) {
      expect(error).toBe(ifDuplicatedError);
    }
  });

  test('should rethrow any error that is not a MongoError with code 11000', async () => {
    const otherError = new Error('other error');
    expect.assertions(1);
    try {
      const input = Promise.reject(otherError);
      await throwIfDuplicated(ifDuplicatedError, input);
    } catch (error) {
      expect(error).toBe(otherError);
    }
  });
});
