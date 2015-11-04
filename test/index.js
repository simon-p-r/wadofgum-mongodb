'use strict';

const Code = require('code');
const Lab = require('lab');
const Wadofgum = require('wadofgum');
const Validation = require('wadofgum-json-schema');
const Mongo = require('../lib/index.js');
const MongoClient = require('mongodb').MongoClient;


// Set-up lab
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('Validation', () => {

    let testDb;
    lab.before((done) => {

        const url = 'mongodb://localhost:27017/test_db';
        MongoClient.connect(url, (err, db) => {

            expect(err).to.not.exist();
            testDb = db;
            done();
        });
    });

    lab.after((done) => {

        testDb.close(() => {

            testDb = null;
            done();
        });
    });

    it('mixin can be loaded', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        expect(User).to.exist();
        expect(User.capabilities.has('mongodb')).to.equal(true);
        done();

    });


    it('set db object to model class', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        User.db = testDb;
        expect(User.meta.get('db')).to.be.an.object();
        expect(User.name).to.equal('User');
        done();

    });

    it('should expose a count method on the model object', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        User.db = testDb;

        User.count((err, count) => {

            expect(err).to.not.exist();
            expect(count).to.be.a.number();
            done();
        });
    });

    it('should expose a count method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        User.db = testDb;

        User.count((err, count) => {

            expect(err).to.not.exist();
            expect(count).to.be.a.number();
            done();
        });
    });

    it('should expose a find method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        User.db = testDb;

        User.find((err, docs) => {

            expect(err).to.not.exist();
            expect(docs).to.be.an.array();
            done();
        });
    });

    it('should expose a save method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.db = testDb;
        const user = new User();

        user.save((err, doc) => {

            expect(err).to.exist();
            expect(doc).to.not.exist();
            User.schema = {
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
                    }
                }

            };
            const validUser = new User({
                name: 'John',
                age: 50,
                dateOfBirth: '05-10-1975'
            });
            validUser.save((err, docA) => {

                expect(err).to.exist();
                expect(docA).to.not.exist();

                validUser.dateOfBirth = '1975-10-05';
                validUser.save({ w: 1 }, (err, docB) => {

                    expect(err).to.not.exist();
                    expect(docB.ops[0]).to.exist();
                    done();
                });
            });
        });
    });

});
