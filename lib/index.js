'use strict';

const Async = require('neo-async');
const Hoek = require('hoek');
const Utils = require('./utils.js');


module.exports = function (baseClass) {

    class Model extends baseClass {

        save() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);

            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }

            if (!this.constructor.capabilities.has('validation')) {
                return cb(new Error('No validation assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$
            if (!this.constructor.meta.has('rids')) {
                const validate = this.validate.bind(this);
                validate((err, result) => {

                    if (err) {
                        return cb(err);
                    }
                    const collection = this.constructor.meta.get('db');
                    return collection.insertOne.call(collection, this, options, cb);
                });
            }
            else {

                const rids = this.constructor.meta.get('rids');
                const id = Utils.generateID(this, rids);
                if (!id) {
                    return cb(new Error('Cannot create id for: ' + this.constructor.name));
                }
                this._id = id;
                const validate = this.validate.bind(this);
                validate((err, result) => {

                    if (err) {
                        return cb(err);
                    }
                    const collection = this.constructor.meta.get('db');
                    return collection.insertOne.call(collection, this, options, cb);
                });
            }


        };

        findOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const projection = (arguments.length === 1 ? {} : arguments[0]);
            const options = {};
            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.constructor.meta.get('db');
            return collection.find.call(collection, { _id: this._id }, projection, options).limit(1).next(cb);
        };

        updateOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);

            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$

            const collection = this.constructor.meta.get('db');
            return collection.updateOne.call(collection, { _id: this._id }, { $set: this }, options, cb);
        };

        replaceOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);

            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }

            if (!this.constructor.capabilities.has('validation')) {
                return cb(new Error('No validation assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$
            const validate = this.validate.bind(this);
            validate((err, result) => {

                if (err) {
                    return cb(err);
                }
                const collection = this.constructor.meta.get('db');
                return collection.replaceOne.call(collection, { _id: this._id }, this, options, cb);
            });
        };

        deleteOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);
            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$
            const collection = this.constructor.meta.get('db');
            return collection.deleteOne.call(collection, { _id: this._id }, options, cb);
        };

        static count() {

            const args = Array.from(arguments);
              // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return callback(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');
            return collection.count.apply(collection, args);
        };

        static distinct() {

            const args = Array.from(arguments);
              // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return callback(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');
            return collection.distinct.apply(collection, args);
        };

        static find() {

            const args = Array.from(arguments);
            // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');
            const callback = args.pop();
            return collection.find.apply(collection, args).toArray(callback);
        };


        static deleteMany() {

            const args = Array.from(arguments);
            // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');
            return collection.deleteMany.apply(collection, args);
        };

        static insertMany() {

            const cb = (arguments.length === 2 ? arguments[1] : arguments[2]);
            const docs = arguments[0];
            const options = (arguments.length === 2 ? { w: 1 } : arguments[1]);

            // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');

            if (!this.meta.has('rids')) {
                const schema = this.meta.get('schema');
                const validator = this.meta.get('validator');
                Async.each(docs, (doc, done) => {

                    validator.validate(doc, schema, (err, valid) => {

                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
                }, (err) => {

                    if (err) {
                        return cb(err);
                    }
                    return collection.insertMany.call(collection, docs, options, cb);
                });
            }
            else {
                const schema = this.meta.get('schema');
                const validator = this.meta.get('validator');
                Async.each(docs, (doc, done) => {

                    const rids = this.meta.get('rids');
                    const id = Utils.generateID(doc, rids);
                    if (!id) {
                        return done(new Error('Cannot create id for: ' + this.name));
                    }
                    doc._id = id;
                    validator.validate(doc, schema, (err, valid) => {

                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
                }, (err) => {

                    if (err) {
                        return cb(err);
                    }
                    return collection.insertMany.call(collection, docs, options, cb);
                });
            }


        };


        static set db(db) {

            const metaSchema = this.meta.get('metaSchema');
            Hoek.assert(metaSchema, 'metaSchema is not defined, please ensure validation mixin has been loaded');
            const name = metaSchema.base;
            const collection = db.collection(name);
            this.meta.set('db', collection);
        };


    };

    Model.capabilities.add('mongodb');
    return Model;
};
