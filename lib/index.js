'use strict';


module.exports = function (baseClass) {

    class Model extends baseClass {

        save () {

            const cb = (arguments.length === 1 ? arguments[0] : arguments[1]);
            const options = (arguments.length === 1 ? {} : arguments[0]);

            // $lab:coverage:off$
            if (!this.constructor.meta.has('db')) {
                return cb(new Error('No db assigned to model class: ' + this.constructor.name));
            }

            if (!this.constructor.capabilities.has('validation')) {
                return cb(new Error('No validation assigned to model class: ' + this.constructor.name));
            }
            // $lab:coverage:on$

            if (!this.constructor.meta.has('schema')) {
                return cb(new Error('No schema assigned to model class: ' + this.constructor.name));
            }

            const validate = this.validate.bind(this);

            validate((err, result) => {

                if (err) {
                    return cb(err);
                }
                const collection = this.constructor.meta.get('db');
                return collection.insertOne.call(collection, this, options, cb);
            });

        };

        static count () {

            const args = Array.from(arguments);
              // $lab:coverage:off$
            if (!this.meta.has('db')) {
                return callback(new Error('No db assigned to model class: ' + this.name));
            }
            // $lab:coverage:on$
            const collection = this.meta.get('db');
            return collection.count.apply(collection, args);
        };

        static find (cb) {

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

        static set db (db) {

            const name = this.name.toLowerCase();
            const collection = db.collection(name);
            this.meta.set('db', collection);
        };

    };

    Model.capabilities.add('mongodb');

    return Model;
};
