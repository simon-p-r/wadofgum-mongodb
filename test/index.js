'use strict';

const Code = require('code');
const Lab = require('lab');
const Wadofgum = require('wadofgum');
const Validation = require('wadofgum-json-schema');
const Mongo = require('../lib/index.js');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const ZSchema = require('z-schema');
const Validator = new ZSchema();

// Fixtures
const UserSchema = require('./fixtures/userSchema.js');

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

    it('should load from a mixin', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        expect(User).to.exist();
        expect(User.capabilities.has('mongodb')).to.equal(true);
        done();

    });

    it('should assert if validation mixin is not defined', (done) => {

        class User extends Wadofgum.mixin(Mongo) {};
        expect(() => {

            User.db = testDb;
        }).to.throw(Error);
        done();

    });


    it('should set db object to model class', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        expect(User.meta.get('db')).to.be.an.object();
        expect(User.type).to.equal('User');
        done();

    });

    it('should expose a save method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        const user = new User();
        user.save((err, doc) => {

            expect(err).to.exist();
            expect(doc).to.not.exist();
            User.schema = UserSchema;
            const validUser = new User({
                _id: ObjectId('563ce539918409541f6b24af'),
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
                    expect(docB.result.n).to.be.above(0);
                    done();
                });
            });
        });
    });

    it('should expose a findOne method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        const user = new User({
            _id: ObjectId('563ce539918409541f6b24af')
        });
        user.findOne((err, doc) => {

            expect(err).to.not.exist();
            expect(doc).to.be.an.object();
            done();
        });
    });

    it('should expose a updateOne method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        const user = new User({
            _id: ObjectId('563ce539918409541f6b24af'),
            person: {
                name: 'Frank',
                age: 35,
                dateOfBirth: '05-10-1981'
            }
        });
        user.updateOne((err, doc) => {

            expect(err).to.not.exist();
            expect(doc.result.nModified).to.equal(1);
            const newUser = new User({
                _id: ObjectId('563ce49d227e258022be8fed'),
                person: {
                    name: 'Frank',
                    age: 105,
                    dateOfBirth: '05-10-1981'
                }
            });
            newUser.updateOne({ upsert: true }, (errA, docA) => {

                expect(errA).to.not.exist();
                expect(docA.result.nModified).to.equal(0);
                done();

            });

        });
    });

    it('should expose a deleteOne method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        const user = new User({
            _id: ObjectId('563ce539918409541f6b24af')
        });
        user.deleteOne((err, res) => {

            expect(err).to.not.exist();
            expect(res.result.n).to.equal(1);
            done();
        });
    });

    it('should expose a count method on the model object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.count((err, count) => {

            expect(err).to.not.exist();
            expect(count).to.be.a.number();
            done();
        });
    });

    it('should expose a distinct method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.distinct('name', (err, docs) => {

            expect(err).to.not.exist();
            expect(docs).to.be.an.array();
            done();
        });
    });

    it('should expose a find method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.find((err, docs) => {

            expect(err).to.not.exist();
            expect(docs).to.be.an.array();
            done();
        });
    });

    it('should expose a deleteMany method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.deleteMany({}, (err, res) => {

            expect(err).to.not.exist();
            expect(res.deletedCount).to.be.above(0);
            done();
        });
    });

});
