## wadofgum-mongodb [![Build Status](https://travis-ci.org/simon-p-r/wadofgum-mongodb.svg)](https://travis-ci.org/simon-pr/wadofgum-mongodb)

A mongodb mixin for [wadofgum](https://github.com/nlf/wadofgum)

### Usage

After extending your model with this mixin, instances of your class will have a `validate` method which accepts a callback as its only parameter.

Simply provide a json schema for validation and then assign it to the static `schema` property on your class then attach a mongodb db handle

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
    model.name // 'test'
    model.age // '45'
    model.dateOfBirth // '1975-10-01'
});
```
### TODO

+ Add replaceOne, insertMany and updateMany methods
