import { throwIfNil } from '../src/throw-if-nil';

describe('throwIfNil()', () => {
  const ifNilError = Error('value is null or undefined');

  test('should return the value when it is not null', async () => {
    const input = Promise.resolve(42);
    const output = await throwIfNil(ifNilError, input);
    expect(output).toBe(42);
  });

  test('should throw when the value is null', async () => {
    const input = Promise.resolve(null);
    await expect(throwIfNil(ifNilError, input)).rejects.toThrow(ifNilError);
  });

  test('should throw when the value is undefined', async () => {
    const input = Promise.resolve(undefined);
    await expect(throwIfNil(ifNilError, input)).rejects.toThrow(ifNilError);
  });
});
