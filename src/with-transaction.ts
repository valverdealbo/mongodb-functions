import { ClientSession, MongoClient } from 'mongodb';

export interface Transaction<T> {
  (session: ClientSession): Promise<T>;
}

export async function withTransaction<T>(client: MongoClient, transaction: Transaction<T>): Promise<T> {
  const wrapper: Record<string, T> = {};
  await client.withSession(async session => {
    await session.withTransaction(async innerSession => {
      wrapper.value = await transaction(innerSession);
    });
  });
  return wrapper.value;
}
