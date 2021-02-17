import { throwIfNull } from './throw-if-null';

describe('throwIfNull()', () => {
  const ifNullError = Error('value is null or undefined');

  test('should return the value when it is not null', async () => {
    const input = Promise.resolve(42);
    const output = await throwIfNull(ifNullError, input);
    expect(output).toBe(42);
  });

  test('should throw when the value is null', async () => {
    expect.assertions(1);
    try {
      const input = Promise.resolve(null);
      await throwIfNull(ifNullError, input);
    } catch (error) {
      expect(error).toBe(ifNullError);
    }
  });
});
