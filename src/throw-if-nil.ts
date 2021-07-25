export async function throwIfNil<T>(ifNilError: Error, promise: Promise<T | null | undefined>): Promise<T> {
  const result = await promise;
  if (result === null || result === undefined) throw ifNilError;
  return result;
}
