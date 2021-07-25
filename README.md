# @valbo/mongodb-functions

Functions to make the MongoDB driver easier to use.

![npm (scoped)](https://img.shields.io/npm/v/@valbo/mongodb-functions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![Build Status](https://img.shields.io/github/workflow/status/valverdealbo/mongodb-functions/CI)
[![Coverage Status](https://coveralls.io/repos/github/valverdealbo/mongodb-functions/badge.svg?branch=main)](https://coveralls.io/github/valverdealbo/mongodb-functions?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/valverdealbo/mongodb-functions/badge.svg?targetFile=package.json)](https://snyk.io/test/github/valverdealbo/mongodb-functions?targetFile=package.json)

## Install

```bash
npm install @valbo/mongodb-functions
```

## Usage

This package exports functions to parse results, throw errors and run transactions with the MongoDB driver.

### Parsing results

Some MongoDB driver functions return easy to use results, like **findOne()** which returns either the found document or null if not found. Other functions return 
complex objects that you have to parse in order to get the actual result.

The **parseResult()** function parses the result of the following MongoDB driver **Collection** methods:

| Collection method   | **parseResult()** returned value           |
| :---                | :---                                       |
| insertOne()         | The _id of the inserted document           |
| insertMany()        | An _id array of the inserted documents     |
| findOneAndUpdate()  | The updated document or null if not found  |
| findOneAndReplace() | The replaced document or null if not found |
| findOneAndDelete()  | The deleted document or null if not found  |
| updateMany()        | The number of documents updated            |
| deleteMany()        | The number of documents deleted            |

```typescript
import { MongoClient, Collection, ObjectId } from 'mongodb';
import { parseResult } from '@valbo/mongodb-functions';

const client = await MongoClient.connect('mongodb://localhost:27017');

interface User {
  username: string;
  name: string;
}

const collection = client.db('tests').collection<User>('users');

const insertedId: ObjectId = await parseResult(collection.insertOne({ name: 'Alice' }));

const insertedIds: ObjectId[] = await parseResult(collection.insertMany([{ name: 'Bob' }, { name: 'Charlie' }]));

const updatedUser: User | null = await parseResult(collection.findOneAndUpdate({ name: 'Bob' }, { $set: { name: 'Robert' } }, { returnDocument: 'after' }));

const replacedUser: User | null = await parseResult(collection.findOneAndReplace({ name: 'Charlie' }, { name: 'Charles' }, { returnDocument: 'after' }));

const deletedUser: User | null = await parseResult(collection.findOneAndDelete({ name: 'Charles' }));

const updatedCount: number = await parseResult(collection.updateMany({}, { $set: { updated: true } }));

const deletedCount: number = await parseResult(collection.deleteMany({ name: 'Charles' }));
```

### Throw error if null

Sometimes you are fine with getting a null when you cannot find, update or delete a document, but sometimes you want to throw an error immediately.

The **throwIfNull()** function will throw the provided error if the result of a promise returns null:

```typescript
import { throwIfNull } from '@valbo/mongodb-functions';

const notFoundError = new Error('user not found');

const user: User = await throwIfNull(notFoundError, parseResult(collection.findOneAndUpdate({ name: 'Charles' }, { $set: { name: 'Charlie' } })));
// throws because document does not exist
```

### Throw error if duplicated

When the MongoDB driver throws an error you have to check if the **error.code** is 11000 to know if it's a duplication error.

The **throwIfDuplicated()** function checks that for you and throws the provided error when the promise throws a duplication error. If the promise throws any 
other kind of error then it is thrown as it is:

```typescript
import { throwIfDuplicated } from '@valbo/mongodb-functions';

const notUniqueError = new Error('user is not unique');

await collection.createIndex({ name: 1 }, { unique: true });

const user: User = await throwIfDuplicated(notUniqueError, parseResult(collection.insertOne({ name: 'Alice' })));
// throws because name is not unique
```

### Transactions

The MongoDB driver has two functions that you have to combine to run a transaction: **withSession()** and **withTransaction()**. Both functions return **void**, 
so it is not easy to return the result from inside a transaction.

The **withTransaction()** function of this package combines the functionality of the those two functions and returns the result of the transaction:

```typescript
import { withTransaction } from '@valbo/mongodb-functions';

const newUser: User | null = await withTransaction(client, async session => {
  const parent: User = await throwIfNull(notFoundError, collection.findOneAndUpdate({ name: 'Robert' }, { $set: { children: 1 } }, { returnOriginal: false, session }));
  return await throwIfDuplicated(notUniqueError, collection.insertOne({ name: 'Daisy', parent: parent.name }, { session }));
});
```
