'use strict';

const Code = require('code');
const Hoek = require('hoek');
const Lab = require('lab');
const Mongo = require('../lib/index.js');
const MongoClient = require('mongodb').MongoClient;
const Wadofgum = require('wadofgum');
const Validation = require('wadofgum-json-schema');
const ZSchema = require('z-schema');
const Validator = new ZSchema();

// Fixtures
const Recs = require('./fixtures/recs.js');
const UserSchema = require('./fixtures/userSchema.js');
const Users = require('./fixtures/data/users.js');

// Set-up lab
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;
const afterEach = lab.afterEach;

describe('Validation', () => {

    let testDb;
    before((done) => {

        const url = 'mongodb://localhost:27017/wadofgum_db';
        MongoClient.connect(url, (err, db) => {

            expect(err).to.not.exist();
            testDb = db;
            done();
        });
    });

    afterEach((done) => {

        testDb.collection('entity').deleteMany({}, (err, result) => {

            expect(err).to.not.exist();
            expect(result).to.exist();
            done();
        });
    });

    beforeEach((done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;

        const userCreate = new User(Users.john);
        const userCreate1 = new User(Users.amy);

        userCreate.save((err, doc) => {

            expect(err).to.not.exist();
            expect(doc).to.exist();

            userCreate1.save((errA, docA) => {

                expect(errA).to.not.exist();
                expect(docA).to.exist();
                done();
            });
        });
    });


    after((done) => {

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


    it('should have properties set to constructor on class', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        expect(User.collection).to.be.an.object();
        expect(User.jSchema).to.be.an.object();
        expect(User.metaSchema).to.be.object();
        done();

    });

    it('should return an error from save method for invalid schema', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        const user = new User();
        user.save((err, doc) => {

            expect(err).to.exist();
            expect(err.details).to.be.an.array();
            expect(doc).to.not.exist();
            done();
        });

    });


    it('should successfully save an object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        const user = new User(Users.frank);

        user.save((err, doc) => {

            expect(err).to.not.exist();
            expect(doc.ops[0]).to.exist();
            expect(doc.result.n).to.be.above(0);
            done();
        });

    });

    it('should successfully save an object with options', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        const user = new User(Users.frank);

        user.save({ j: true }, (err, doc) => {

            expect(err).to.not.exist();
            expect(doc.ops[0]).to.exist();
            expect(doc.result.n).to.be.above(0);
            done();
        });

    });



    it('should generate an id on save method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.rids = ['person.name', 'person.age'];
        User.validator = Validator;
        const user = new User(Users.frank);

        user.save((err, doc) => {

            expect(err).to.not.exist();
            expect(doc).to.exist();
            done();

        });
    });


    it('should fail on save after successfully generating an id', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.rids = ['person.name', 'person.age'];
        User.validator = Validator;
        const user = new User(Users.fred);

        user.save((err, doc) => {

            expect(err).to.exist();
            expect(err.details[0].code).to.equal('INVALID_FORMAT');
            expect(doc).to.not.exist();
            done();
        });
    });

    it('should fail to generate an id on save method due to invalid rids', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.rids = ['name', 'age'];
        User.validator = Validator;
        const user = new User(Users.fred);

        user.save((err, doc) => {

            expect(err).to.exist();
            expect(doc).to.not.exist();
            done();
        });
    });



    it('should successfully findOne', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;

        const userFind = new User({
            _id: '1'
        });

        userFind.findOne((err, docA) => {

            expect(err).to.not.exist();
            expect(docA._id).to.equal('1');
            expect(docA.person.name).to.equal('John');

            userFind.findOne({ 'person.name': 0 }, (err, docB) => {

                expect(err).to.not.exist();
                expect(docB._id).to.equal('1');
                expect(docB.person.name).to.not.exist();
                done();
            });
        });


    });

    it('should updateOne', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        const user = new User({
            _id: '1',
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
                _id: '1',
                person: {
                    name: 'Frank',
                    age: 105,
                    dateOfBirth: '05-10-1981'
                }
            });
            newUser.updateOne({ upsert: true }, (errA, docA) => {

                expect(errA).to.not.exist();
                expect(docA.result.nModified).to.equal(1);
                done();
            });

        });
    });

    it('should expose a replaceOne method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;

        const user = new User(Users.frank);
        user._id = '1';
        user.replaceOne((errA, docA) => {

            expect(errA).to.not.exist();
            expect(docA.result.nModified).to.equal(1);
            expect(docA.ops[0]._id).to.equal('1');
            expect(docA.ops[0].person.name).to.equal('Frank');
            expect(docA.ops[0].person.age).to.equal(50);
            expect(docA.ops[0].person.dateOfBirth).to.equal('1965-10-05');

            const newUser = new User(Users.fred);
            newUser.replaceOne({ bypassDocumentValidation: true }, (errB, docB) => {

                expect(errB).to.exist();
                expect(errB.details[0].code).to.contain('INVALID_FORMAT');
                expect(docB).to.not.exist();
                done();
            });
        });


    });

    it('should expose a deleteOne method on the instance of model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        const user = new User({
            _id: '1'
        });
        user.deleteOne({ bypassDocumentValidation: true }, (err, res) => {

            expect(err).to.not.exist();
            expect(res.result.n).to.equal(1);
            expect(user._id).to.equal('1');

            const nextUser = new User({
                _id: '4'
            });
            nextUser.deleteOne((err, resA) => {

                expect(err).to.not.exist();
                expect(resA.result.n).to.equal(1);
                expect(nextUser._id).to.equal('4');
                done();
            });
        });
    });

    it('should return an error from deleteOne method due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        const user = new User({
            _id: '1'
        });
        user.deleteOne({}, (err, res) => {

            expect(err).to.exist();
            done();
        });
    });

    it('should expose a count method on the model object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.count((err, count) => {

            expect(err).to.not.exist();
            expect(count).to.be.a.number().and.equal(2);
            done();
        });
    });

    it('should return an error from count static due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.count({}, (err, res) => {

            expect(err).to.exist();
            done();
        });
    });

    it('should expose a distinct method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.distinct('person.name', (err, docs) => {

            expect(err).to.not.exist();
            expect(docs).to.include(['Amy', 'John']);
            expect(docs).to.be.an.array().and.to.have.length(2);
            done();
        });
    });

    it('should return an error from distinct static due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.distinct({}, (err, res) => {

            expect(err).to.exist();
            done();
        });
    });

    it('should expose a find method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Mongo, Validation) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.find((err, docs) => {

            expect(err).to.not.exist();
            expect(docs).to.be.an.array().and.to.have.length(2);
            done();
        });
    });

    it('should return an error from find static due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.find({}, (err, res) => {

            expect(err).to.exist();
            done();
        });
    });

    it('should expose a insertMany method on the model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.db = testDb;
        User.validator = Validator;
        User.insertMany(Recs, (err, res) => {

            expect(err).to.not.exist();
            expect(res.insertedCount).to.equal(3);
            expect(res.ops[0].person.name).to.be.a.string();
            expect(res.ops[0].person.age).to.be.a.number();
            User.insertMany(Recs, (err, resA) => {

                expect(err).to.exist();
                expect(err.details[0].code).to.equal('INVALID_TYPE');
                expect(resA).to.not.exist();
                done();
            });
        });
    });

    it('should insertMany and created custom ids from rids on the model class object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        const ridsSchema = Hoek.clone(UserSchema);
        ridsSchema.metaSchema.rids = ['name', 'age'];
        User.schema = ridsSchema;
        User.db = testDb;
        User.validator = Validator;
        User.insertMany(Recs, (err, res) => {

            expect(err).to.exist();
            expect(err.details).to.include(['name', 'age']);
            ridsSchema.metaSchema.rids = ['person.name', 'person.dateOfBirth'];
            User.schema = ridsSchema;

            User.insertMany(Recs, { wtimeout: 5000 }, (err, resA) => {

                expect(err).to.not.exist();
                expect(resA.ops).to.have.length(3);
                expect(resA.insertedIds).to.include(['sam::1994-12-25', 'frank::1964-12-25', 'kathy::1974-12-25']);

                Recs[0].person.age = null;
                User.insertMany(Recs, { wtimeout: 5000 }, (err, resB) => {

                    expect(err).to.exist();
                    expect(err.details[0]).to.be.an.object();
                    expect(err.details[0].code).to.equal('INVALID_TYPE');
                    done();
                });
            });
        });
    });

    it('should return an error from insertMany static due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.insertMany(Recs, (err, res) => {

            expect(err).to.exist();
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

    it('should return an error from deleteMany static due to missing db object', (done) => {

        class User extends Wadofgum.mixin(Validation, Mongo) {};
        User.schema = UserSchema;
        User.deleteMany({}, (err, res) => {

            expect(err).to.exist();
            done();
        });
    });

});
