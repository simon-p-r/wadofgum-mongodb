'use strict';

module.exports = {

    metaSchema: {
        description: 'user example schema',
        type: 'collection',
        jsonSchema: 'v4',
        name: 'user',
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
        },
        required: ['name', 'age', 'dateOfBirth']
    }

};
