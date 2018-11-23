/**
 * Created by rolando on 08/08/2018.
 */
const Promise = require('bluebird');
const R = require('rambda');
const logger = require("./winston");
const curies = require ("./utils/curie_expansion");
const path = require("path");
const fs = require('fs');

const ErrorReport = require('./model/error-report');
const ValidationReport = require('./model/validation-report');

let Ajv = require("ajv");
const request = require("request-promise");
const cachedSchemas = {};


/**
 *
 * Wraps the generic validator, outputs errors in custom format.
 *
 */
class ElixirValidator {
    constructor(keywords, options) {
        this.schemaCache = {};
        this.validatorCache = {};
        this.baseSchemaPath = null;

        if (options) {
            options['allErrors'] = true;
            options['schemaId'] = 'auto';
            if (!options.loadSchema) {
                options.loadSchema = this.loadSchemaRef;
            }

            if (options.baseSchemaPath) {
                this.baseSchemaPath = options.baseSchemaPath
            }

        } else {
            options = {allErrors: true, schemaId: 'auto', loadSchema: this.loadSchemaRef};
        }


        this.ajv = new Ajv(options);
        this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

        if (Array.isArray(keywords)) {
            for (let keyword of keywords) {
                new keyword(this.ajv)
            }
        }
    }

    loadSchemaRef(uri) {


        if(cachedSchemas[uri]) {
            return Promise.resolve(cachedSchemas[uri]);
        } else {
            if (this.baseSchemaPath) {
                let ref = path.join(this.baseSchemaPath, uri);
                console.log('loading ref ' + ref);
                let jsonSchema = fs.readFileSync(ref);
                let loadedSchema = JSON.parse(jsonSchema);
                loadedSchema["$async"] = true;
                cachedSchemas[uri] = loadedSchema;
                return Promise.resolve(loadedSchema);
            }
            else {
                return new Promise((resolve, reject) => {
                    request({
                        method: "GET",
                        url: uri,
                        json: true
                    }).then(resp => {
                        const loadedSchema = resp;
                        loadedSchema["$async"] = true;
                        cachedSchemas[uri] = loadedSchema;
                        resolve(loadedSchema);
                    }).catch(err => {
                        reject(err);
                    });
                });
            }
        }
    }

    validate_with_remote_schema(schemaUri, document) {
        return this.getSchema(schemaUri)
            .then(schema => {return this.validate(document, schema)})
    }

    validate(schema, document) {
        return this._validateSingleSchema(schema, document)
            .then(valErrors => {return this.parseValidationErrors(valErrors)})
            .then(parsedErrors => {return this.generateValidationReport(parsedErrors)})
    }

    _validateSingleSchema (inputSchema, inputObject) {
        inputSchema["$async"] = true;
        const schemaId = !inputSchema['$id'] ? inputSchema : inputSchema['$id'];

        logger.log("silly", "Running validation...");
        return new Promise((resolve, reject) => {

            let compiledSchemaPromise = null;
            if(this.validatorCache[schemaId]) {
                compiledSchemaPromise = Promise.resolve(this.validatorCache[schemaId]);
                console.info()
            } else {
                compiledSchemaPromise = this.ajv.compileAsync(inputSchema);
            }

            compiledSchemaPromise.then((validate) => {
                this.validatorCache[schemaId] = validate;
                Promise.resolve(validate(inputObject))
                    .then((data) => {
                            if (validate.errors) {
                                logger.log("debug", this.ajv.errorsText(validate.errors, {dataVar: inputObject.alias}));
                                resolve(validate.errors);
                            } else {
                                resolve([]);
                            }
                        }
                    ).catch((err, errors) => {
                    if (!(err instanceof Ajv.ValidationError)) {
                        logger.log("error", "An error ocurred while running the validation.");
                        reject(new AppError("An error ocurred while running the validation."));
                    } else {
                        logger.log("debug", this.ajv.errorsText(err.errors, {dataVar: inputObject.alias}));
                        resolve(err.errors);
                    }
                });
            }).catch((err) => {
                console.log("async schema compiled encountered and error");
                console.log(err.stack);
                reject(err);
            });
        });
    }

    getSchema(schemaUri) {
        if(! cachedSchemas[schemaUri]) {
            return new Promise((resolve, reject) => {
                this.fetchSchema(schemaUri)
                    .then(schema => {
                        cachedSchemas[schemaUri] = schema;
                        resolve(schema);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        } else {
            return Promise.resolve(cachedSchemas[schemaUri]);
        }
    }

    fetchSchema(schemaUrl) {
        return request({
            method: "GET",
            url: schemaUrl,
            json: true,
        });
    }

    insertSchemaId(schema) {
        if(schema["id"]) {
            schema["$id"] = schema["id"];
        }
        return Promise.resolve(schema);
    }

    /**
     * Ingest error reports from ajvError objects
     * @param errors
     */
    parseValidationErrors(errors){
        return Promise.resolve(R.map(ajvErr => new ErrorReport(ajvErr), errors));
    }

    generateValidationReport(errors) {
        let report = null;

        if(errors.length > 0) {
            report = new ValidationReport("INVALID", errors);
        } else {
            report =  ValidationReport.okReport();
        }

        return Promise.resolve(report);
    }


}

module.exports = ElixirValidator;