import { ClientSession, MongoClient } from 'mongodb';

export interface Transaction<T> {
  (session: ClientSession): Promise<T>;
}

export async function withTransaction<T>(client: MongoClient, transaction: Transaction<T>): Promise<T> {
  return client.withSession(async session => {
    return session.withTransaction(async innerSession => {
      return transaction(innerSession);
    });
  });
}
