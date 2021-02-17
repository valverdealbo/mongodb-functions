export async function throwIfNull<T>(ifNullError: Error, promise: Promise<T | null>): Promise<T> {
  const result = await promise;
  if (result === null) throw ifNullError;
  return result;
}
