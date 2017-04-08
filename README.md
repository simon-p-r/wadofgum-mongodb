## wadofgum-mongodb

[![Greenkeeper badge](https://badges.greenkeeper.io/simon-p-r/wadofgum-mongodb.svg)](https://greenkeeper.io/)
[![build status](https://travis-ci.org/simon-p-r/wadofgum-mongodb.svg?branch=master)](https://travis-ci.org/simon-p-r/wadofgum-mongodb)
[![Current Version](https://img.shields.io/npm/v/wadofgum-mongodb.svg?maxAge=1000)](https://www.npmjs.org/package/wadofgum-mongodb)
[![dependency Status](https://img.shields.io/david/simon-p-r/wadofgum-mongodb.svg?maxAge=1000)](https://david-dm.org/simon-p-r/wadofgum-mongodb)
[![devDependency Status](https://img.shields.io/david/dev/simon-p-r/wadofgum-mongodb.svg?maxAge=1000)](https://david-dm.org/simon-p-r/wadofgum-mongodb?type=dev)
[![Coveralls](https://img.shields.io/coveralls/simon-p-r/wadofgum-mongodb.svg?maxAge=1000)](https://coveralls.io/github/simon-p-r/wadofgum-mongodb)
A mongodb mixin for [wadofgum](https://github.com/nlf/wadofgum)

#### Usage

After extending your model with this mixin, instances of your class will have various wrapped mongodb crud methods.

An example of how to use is shown below

```js
const Wadofgum = require('wadofgum');
const Validation = require('wadofgum-json-schema');
const MongoDB = require('wadofgum-mongodb');

class Model extends Wadofgum.mixin(Validation, MongoDB) {};
Model.schema = {
    metaSchema: {
        description: 'Person record schema',
        type: 'record',
        base: 'entity',
        jsonSchema: 'v4',
        name: 'person',
        version: 1
    },
    schema: {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            age: {
                type: 'integer'
            },
            dateOfBirth: {
                type: 'string',
                format: 'date'
            }
        }
    }
};

Model.db = db //mongodb database handle created by MongoClient method
Model.validator = validator // z-schema handle created by z-schema constructor object

let model = new Model({ name: 'test', age: '45', dateOfBirth: '1975-10-01'});
model.save((err, result) => {
    err // null
    model.name // 'test'
    model.age // '45'
    model.dateOfBirth // '1975-10-01'
});
```
### TODO

+ Implement a better interface for custom _id
+ Static methods on class object must only do crud based on the model type so parameters passed to mongo must be restricted
+ Parse queries from mongo better
+ Implement methods on models
