"use strict";
/**
 * Created by rolando on 08/08/2018.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird_1 = __importDefault(require("bluebird"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var ajv_1 = __importDefault(require("ajv"));
var request_promise_1 = __importDefault(require("request-promise"));
var application_error_1 = __importDefault(require("./model/application-error"));
/**
 *
 * Wraps the generic validator, outputs errors in custom format.
 *
 */
var ElixirValidator = /** @class */ (function () {
    function ElixirValidator(customKeywordValidators, baseSchemaPath) {
        this.cachedSchemas = {};
        this.validatorCache = {};
        this.cachedSchemas = {};
        this.ajvInstance = this.constructAjv(customKeywordValidators);
        this.baseSchemaPath = baseSchemaPath;
        this.customKeywordValidators = customKeywordValidators;
    }
    ElixirValidator.prototype.validate = function (inputSchema, inputObject) {
        var _this = this;
        inputSchema["$async"] = true;
        return new bluebird_1.default(function (resolve, reject) {
            var compiledSchemaPromise = _this.getValidationFunction(inputSchema);
            compiledSchemaPromise.then(function (validate) {
                bluebird_1.default.resolve(validate(inputObject))
                    .then(function (data) {
                    if (validate.errors) {
                        resolve(validate.errors);
                    }
                    else {
                        resolve([]);
                    }
                }).catch(function (err) {
                    if (!(err instanceof ajv_1.default.ValidationError)) {
                        console.error("An error occurred while running the validation.");
                        reject(new application_error_1.default("An error occurred while running the validation."));
                    }
                    else {
                        console.debug("debug", _this.ajvInstance.errorsText(err.errors, { dataVar: inputObject["alias"] }));
                        resolve(err.errors);
                    }
                });
            }).catch(function (err) {
                console.error("async schema compiled encountered and error");
                console.error(err.stack);
                reject(err);
            });
        });
    };
    ElixirValidator.prototype.validateWithRemoteSchema = function (schemaUri, document) {
        var _this = this;
        return this.getSchema(schemaUri)
            .then(function (schema) { return _this.validate(document, schema); });
    };
    ElixirValidator.prototype.getSchema = function (schemaUri) {
        var _this = this;
        if (!this.cachedSchemas[schemaUri]) {
            return new bluebird_1.default(function (resolve, reject) {
                ElixirValidator.fetchSchema(schemaUri)
                    .then(function (schema) {
                    _this.cachedSchemas[schemaUri] = schema;
                    resolve(schema);
                })
                    .catch(function (err) {
                    reject(err);
                });
            });
        }
        else {
            return bluebird_1.default.resolve(this.cachedSchemas[schemaUri]);
        }
    };
    ElixirValidator.fetchSchema = function (schemaUrl) {
        return bluebird_1.default.resolve(request_promise_1.default({
            method: "GET",
            url: schemaUrl,
            json: true,
        }));
    };
    ElixirValidator.prototype.getValidationFunction = function (inputSchema) {
        var schemaId = inputSchema['$id'];
        if (this.validatorCache[schemaId]) {
            return bluebird_1.default.resolve(this.validatorCache[schemaId]);
        }
        else {
            var compiledSchemaPromise = bluebird_1.default.resolve(this.ajvInstance.compileAsync(inputSchema));
            if (schemaId) {
                this.validatorCache[schemaId] = compiledSchemaPromise;
            }
            return bluebird_1.default.resolve(compiledSchemaPromise);
        }
    };
    ElixirValidator.prototype.constructAjv = function (customKeywordValidators) {
        var ajvInstance = new ajv_1.default({ allErrors: true, schemaId: 'id', loadSchema: this.generateLoadSchemaRefFn() });
        ajvInstance.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        ElixirValidator._addCustomKeywordValidators(ajvInstance, customKeywordValidators);
        return ajvInstance;
    };
    ElixirValidator._addCustomKeywordValidators = function (ajvInstance, customKeywordValidators) {
        customKeywordValidators.forEach(function (customKeywordValidator) {
            ajvInstance = customKeywordValidator.configure(ajvInstance);
        });
        return ajvInstance;
    };
    ElixirValidator.prototype.generateLoadSchemaRefFn = function () {
        var cachedSchemas = this.cachedSchemas;
        var baseSchemaPath = this.baseSchemaPath;
        var loadSchemaRefFn = function (uri) {
            if (cachedSchemas[uri]) {
                return bluebird_1.default.resolve(cachedSchemas[uri]);
            }
            else {
                if (baseSchemaPath) {
                    var ref = path_1.default.join(baseSchemaPath, uri);
                    console.log('loading ref ' + ref);
                    var jsonSchema = fs_1.default.readFileSync(ref);
                    var loadedSchema = JSON.parse(jsonSchema.toString());
                    loadedSchema["$async"] = true;
                    cachedSchemas[uri] = loadedSchema;
                    return bluebird_1.default.resolve(loadedSchema);
                }
                else {
                    return new bluebird_1.default(function (resolve, reject) {
                        request_promise_1.default({
                            method: "GET",
                            url: uri,
                            json: true
                        }).then(function (resp) {
                            var loadedSchema = resp;
                            loadedSchema["$async"] = true;
                            cachedSchemas[uri] = loadedSchema;
                            resolve(loadedSchema);
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                }
            }
        };
        return loadSchemaRefFn;
    };
    return ElixirValidator;
}());
exports.default = ElixirValidator;
