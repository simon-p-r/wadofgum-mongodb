'use strict';

module.exports = {

    metaSchema: {
        description: 'user example schema',
        type: 'collection',
        jsonSchema: 'v4',
        name: 'user',
        base: 'entity',
        version: 1
    },
    schema: {
        type: 'object',
        properties: {
            person: {
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
                additionalProperties: false,
                required: ['name', 'age', 'dateOfBirth']
            },
            _id: {
                type: 'string'
            }
        },
        additionalProperties: false,
        required: ['person']

    }

};
