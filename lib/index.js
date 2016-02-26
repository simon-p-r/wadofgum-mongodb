'use strict';

const Async = require('neo-async');
const Hoek = require('hoek');
const Utils = require('./utils.js');


module.exports = function (baseClass) {

    class Model extends baseClass {

        save() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);
            const collection = this.constructor.collection;

            // $lab:coverage:off$
            if (!this.constructor.jSchema) {
                return cb(new Error('No validation assigned to model class: ' + this.constructor.name));
            }

            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }


            // $lab:coverage:on$
            if (!this.constructor.rids) {
                const validate = this.validate.bind(this);
                validate((err, result) => {

                    if (err) {
                        return cb(err);
                    }

                    return collection.insertOne.call(collection, this, options, cb);
                });
            }
            else {

                const rids = this.constructor.rids;
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

                    return collection.insertOne.call(collection, this, options, cb);
                });
            }
        };

        findOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const projection = (arguments.length === 1 ? {} : arguments[0]);
            const options = {};
            const collection = this.constructor.collection;
            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$

            return collection.find.call(collection, { _id: this._id }, projection, options).limit(1).next(cb);
        };

        updateOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);
            const collection = this.constructor.collection;

            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$


            return collection.updateOne.call(collection, { _id: this._id }, { $set: this }, options, cb);
        };

        replaceOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);
            const collection = this.constructor.collection;

            // $lab:coverage:off$
            if (!collection) {
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

                return collection.replaceOne.call(collection, { _id: this._id }, this, options, cb);
            });
        };

        deleteOne() {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? { w: 1 } : arguments[0]);
            const collection = this.constructor.collection;
            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$

            return collection.deleteOne.call(collection, { _id: this._id }, options, cb);
        };

        static count() {

            const args = Array.from(arguments);
            const collection = this.collection;
            const callback = args - 1;
              // $lab:coverage:off$
            if (!collection) {
                return callback(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$

            return collection.count.apply(collection, args);
        };

        static distinct() {

            const args = Array.from(arguments);
            const collection = this.collection;
              // $lab:coverage:off$
            if (!collection) {
                return callback(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$

            return collection.distinct.apply(collection, args);
        };

        static find() {

            const args = Array.from(arguments);
            const collection = this.collection;
            const cb = args.pop();
            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            return collection.find.apply(collection, args).toArray(cb);
        };


        static deleteMany() {

            const args = Array.from(arguments);
            const collection = this.collection;
            const cb = args.pop;
            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            return collection.deleteMany.apply(collection, args);
        };

        static insertMany() {

            const cb = (arguments.length === 2 ? arguments[1] : arguments[2]);
            const docs = arguments[0];
            const options = (arguments.length === 2 ? { w: 1 } : arguments[1]);
            const metaSchema = this.metaSchema;
            const collection = this.collection;
            const schema = this.jSchema;
            const validator = this.valid;

            // $lab:coverage:off$
            if (!collection) {
                return cb(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$

            if (!this.rids) {

                Async.each(docs, (doc, done) => {

                    validator.validate(doc, schema, (err, valid) => {

                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
                }, (err) => {

                    if (err) {
                        const error = new Error('JSON schema validation has failed for model ' + metaSchema.name);
                        error.details = err;
                        return cb(error);
                    }
                    return collection.insertMany.call(collection, docs, options, cb);
                });
            }
            else {


                Async.each(docs, (doc, done) => {

                    const rids = this.rids;
                    const id = Utils.generateID(doc, rids);
                    if (!id) {
                        const error = new Error('Cannot create id from rids for model: ' + metaSchema.name);
                        error.details = rids.toString();
                        return done(error);
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
                        if (Array.isArray(err)) {
                            const error = new Error('JSON schema validation has failed for model ' + metaSchema.name);
                            error.details = err;
                            return cb(error);
                        }
                        return cb(err);

                    }
                    return collection.insertMany.call(collection, docs, options, cb);
                });
            }


        };


        static set db(db) {

            const metaSchema = this.metaSchema;
            Hoek.assert(metaSchema, 'metaSchema is not defined, please ensure validation mixin has been loaded');
            const name = metaSchema.base;
            this.collection = db.collection(name);
        };


    };

    Model.capabilities.add('mongodb');
    return Model;
};
