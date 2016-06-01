## Changelog

+ 1.1.1 - updated badge link for coveralls

+ 1.1.0 - bumped dependencies, added coveralls and updated travis file

+ 1.0.0 - changes due to wadofgum core changes, improved tests and removed pre-test mongodb script.  Bumped other deps

+ 0.4.1 - updated dependencies

+ 0.4.0 - minor bump for changes in errors returned by insertMany as using its own validate method rather than wadofgum-json-schema

+ 0.3.0 - added validation to insertMany method, improved tests to keep coverage and added neo-async dependency

+ 0.2.1 - enabled use of rids from metaSchema to be used to create _id if specified, added generation on insert and insertMany.  Updated docs as not correct.

+ 0.2.0 - added insertMany with test however method doesn't validate calling code will have to validate for now until change can be made, also updated mongodb dev dependency

+ 0.1.1 - fixed updateOne to $set on update to allow partial update rather than document replacement, updated lab and hoek dependencies

+ 0.1.0 - minor bump for updated deps

+ 0.0.5 - fixed findOne not working with projection for returned object from mongo

+ 0.0.4 - updated dependencies, added mongo script for tests and improved tests.  Added replaceOne method for full document replacement with full document validation.

+ 0.0.3 - update dependencies and cleaned up tests

+ 0.0.2 - added more methods to instance of model object as well as class model object, added validation to insertOne method, updateOne has no validation as partial update
