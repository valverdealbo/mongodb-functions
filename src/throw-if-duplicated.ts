export async function throwIfDuplicated<T>(ifDuplicatedError: Error, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error.code === 11000) {
      throw ifDuplicatedError;
    }
    throw error;
  }
}
