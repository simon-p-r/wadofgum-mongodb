'use strict';

const Compact = require('deep-compact');

const internals = {};

internals.createRID = (payload) => {



};

exports.addControl = (payload) => {

    payload = Compact(payload);
    payload.control = {
        createdAt: new Date(),
        createdBy: credentials,
        updatedAt: new Date(),
        updatedBy: credentials,
        schemaVersion: model.meta.version,
        sid: internals.createRID(payload, fields)
    };
    return payload;

};
