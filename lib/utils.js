'use strict';

const Hoek = require('hoek');
exports.SID_DIVIDER = '::';
const Utils = require('basic-utils');

exports.generateID = (payload, rids) => {

    let _id = '';

    for (let i = 0; i < rids.length; ++i) {

        const rid = rids[i];
        let v = Hoek.reach(payload, rid);
        if (Utils.isString(v)) {
            v = v.trim();
            _id += v + exports.SID_DIVIDER;
        }
    }
    _id = _id.slice(0, _id.length - 2).toLowerCase();
    return _id;

};
