# [3.0.0](https://github.com/valverdealbo/mongodb-functions/compare/v2.1.0...v3.0.0) (2023-12-22)


### Bug Fixes

* upgrade github actions CI workflow node version to 18 ([d258b25](https://github.com/valverdealbo/mongodb-functions/commit/d258b25a31c95c0281deaf252da42806cbfe44d9))


### Features

* update package to MongoDB driver 6 ([2d521ec](https://github.com/valverdealbo/mongodb-functions/commit/2d521eccbd19ce23e2ecc8340ceef41f64ed6ec2))


### BREAKING CHANGES

* driver has changed the behaviour of findOneAndX, withSession and withTransaction

# [2.1.0](https://github.com/valverdealbo/mongodb-functions/compare/v2.0.1...v2.1.0) (2021-07-25)


### Features

* replace throwIfNull for throwIfNil ([aa94bb8](https://github.com/valverdealbo/mongodb-functions/commit/aa94bb840a9823266880e7d85da16268da03aade))

## [2.0.1](https://github.com/valverdealbo/mongodb-functions/compare/v2.0.0...v2.0.1) (2021-07-25)


### Bug Fixes

* parseResult() of insertOne/insertMany returns the _id of the inserted document/s ([e858f17](https://github.com/valverdealbo/mongodb-functions/commit/e858f1777d3b4cdfebee6e731bcc4820e9de439b))

# [2.0.0](https://github.com/valverdealbo/mongodb-functions/compare/v1.0.4...v2.0.0) (2021-07-25)


### Features

* update to mongodb driver v4 ([41439a1](https://github.com/valverdealbo/mongodb-functions/commit/41439a13709807fc8dfd25879fb07cbba064123b))


### BREAKING CHANGES

* parsing inserts no longer accepts a projection and returns inserted count instead
of inserted documents

## [1.0.4](https://github.com/valverdealbo/mongodb-functions/compare/v1.0.3...v1.0.4) (2021-04-18)


### Bug Fixes

* update dependencies and tools configurations ([6b2ff11](https://github.com/valverdealbo/mongodb-functions/commit/6b2ff114a1274a157e42647b92cf2649cd2dc2bd))

## [1.0.3](https://github.com/valverdealbo/mongodb-functions/compare/v1.0.2...v1.0.3) (2021-02-19)


### Bug Fixes

* update license to MIT ([6b0a549](https://github.com/valverdealbo/mongodb-functions/commit/6b0a549b3bb2279d87ca45cbea6377a61a429aa1))

## [1.0.2](https://github.com/valverdealbo/mongodb-functions/compare/v1.0.1...v1.0.2) (2021-02-17)


### Bug Fixes

* update dependencies ([120c4a3](https://github.com/valverdealbo/mongodb-functions/commit/120c4a3300eedd59c37c4beaee47261abb6c316e))
