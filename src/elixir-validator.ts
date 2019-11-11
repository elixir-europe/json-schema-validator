/**
 * Created by rolando on 08/08/2018.
 */

import Promise from "bluebird";
import path from "path";
import fs from "fs";
import ajv, {Ajv, ErrorObject, ValidateFunction} from "ajv";
import request from "request-promise";
import AppError from "./model/application-error";
import {IElixirValidator, Json} from "./common/interfaces";
import {CustomAjvKeyword} from "./common/interfaces";

/**
 *
 * Wraps the generic validator, outputs errors in custom format.
 *
 */

class ElixirValidator implements IElixirValidator {
    validatorCache: Record<string, Promise<ValidateFunction>>;
    cachedSchemas: any = {};
    ajvInstance: Ajv;
    customKeywordValidators: CustomAjvKeyword[];
    baseSchemaPath?: string;

    constructor(customKeywordValidators: CustomAjvKeyword[], baseSchemaPath?: string){
        this.validatorCache= {};
        this.cachedSchemas = {};
        this.ajvInstance = this.constructAjv(customKeywordValidators);
        this.baseSchemaPath = baseSchemaPath;
        this.customKeywordValidators = customKeywordValidators;
    }

    validate(inputSchema: Json, inputObject: Json) : Promise<ErrorObject[]> {
        inputSchema["$async"] = true;
        return new Promise((resolve, reject) => {
            const compiledSchemaPromise = this.getValidationFunction(inputSchema);

            compiledSchemaPromise.then((validate) => {
                Promise.resolve(validate(inputObject))
                    .then((data) => {
                            if (validate.errors) {
                                resolve(validate.errors);
                            } else {
                                resolve([]);
                            }
                        }
                    ).catch((err) => {
                    if (!(err instanceof ajv.ValidationError)) {
                        console.error("An error occurred while running the validation.");
                        reject(new AppError("An error occurred while running the validation."));
                    } else {
                        console.debug("debug", this.ajvInstance.errorsText(err.errors, {dataVar: inputObject["alias"] as string}));
                        resolve(err.errors);
                    }
                });
            }).catch((err) => {
                console.error("async schema compiled encountered and error");
                console.error(err.stack);
                reject(err);
            });
        });
    }

    validateWithRemoteSchema(schemaUri: string, document:Json) {
        return this.getSchema(schemaUri)
            .then(schema => {return this.validate(document, schema)})
    }

    getSchema(schemaUri: string) : Promise<Json>{
        if(! this.cachedSchemas[schemaUri]) {
            return new Promise((resolve, reject) => {
                ElixirValidator.fetchSchema(schemaUri)
                    .then(schema => {
                        this.cachedSchemas[schemaUri] = schema;
                        resolve(schema);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        } else {
            return Promise.resolve(this.cachedSchemas[schemaUri]);
        }
    }

    static fetchSchema(schemaUrl: string): Promise<Json> {
        return Promise.resolve(
            request({
                method: "GET",
                url: schemaUrl,
                json: true,
            })
        );
    }

    getValidationFunction(inputSchema: Json) {
        const schemaId = inputSchema['$id'] as string;

        if(this.validatorCache[schemaId]) {
            return Promise.resolve(this.validatorCache[schemaId]);
        } else {
            const compiledSchemaPromise = Promise.resolve(this.ajvInstance.compileAsync(inputSchema));
            if(schemaId) {
                this.validatorCache[schemaId] = compiledSchemaPromise;
            }
            return Promise.resolve(compiledSchemaPromise);
        }
    }

    constructAjv(customKeywordValidators: CustomAjvKeyword[]) {
        const ajvInstance = new ajv({allErrors: true, schemaId: 'id', loadSchema: this.generateLoadSchemaRefFn()});
        ajvInstance.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        ElixirValidator._addCustomKeywordValidators(ajvInstance, customKeywordValidators);

        return ajvInstance
    }

    static _addCustomKeywordValidators(ajvInstance: Ajv, customKeywordValidators: CustomAjvKeyword[]) {
        customKeywordValidators.forEach(customKeywordValidator => {
            ajvInstance = customKeywordValidator.configure(ajvInstance);
        });

        return ajvInstance;
    }

    generateLoadSchemaRefFn() {
        const cachedSchemas = this.cachedSchemas;
        const baseSchemaPath = this.baseSchemaPath;

        const loadSchemaRefFn = (uri: string) => {
            if(cachedSchemas[uri]) {
                return Promise.resolve(cachedSchemas[uri]);
            } else {
                if (baseSchemaPath) {
                    let ref = path.join(baseSchemaPath, uri);
                    console.log('loading ref ' + ref);
                    let jsonSchema = fs.readFileSync(ref);
                    let loadedSchema = JSON.parse(jsonSchema.toString());
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
        };

        return loadSchemaRefFn;
    }
}

export default ElixirValidator;