import {CustomAjvKeyword} from "../common/interfaces";
import {Ajv, ErrorObject, SchemaValidateFunction} from "ajv";
import * as ajv from "ajv";
import request from "request-promise";
import logger from "../winston";

class IsValidTerm implements CustomAjvKeyword {
    keywordName: string;
    olsSearchUrl: string;
    constructor(olsSearchUrl: string, keywordName?: string) {
        this.keywordName = keywordName ? keywordName : "isValidTerm";
        this.olsSearchUrl = olsSearchUrl;
    }

    configure(ajv: Ajv) {
        const keywordDefinition = {
            async: this.isAsync(),
            type: "string",
            validate: this.generateKeywordFunction(),
            errors: true
        };

        return ajv.addKeyword(this.keywordName, keywordDefinition);
    }

    keywordFunction(): SchemaValidateFunction {
        return this.generateKeywordFunction();
    }

    isAsync(): boolean {
        return true;
    }

    generateKeywordFunction(): SchemaValidateFunction {
        const generateErrorObject: (message: string, params?: any) => ErrorObject = (message) => {
            return {
                keyword: this.keywordName,
                message: message,
                dataPath: "",
                schemaPath: "",
                params: {}
            };
        };

        const findTerm = (schema: any, data: any) => {
            return new Promise((resolve, reject) => {
                if (schema) {
                    let errors: ErrorObject[] = [];

                    const termUri = data;
                    const encodedTermUri = encodeURIComponent(termUri);
                    const url = this.olsSearchUrl + encodedTermUri + "&exact=true&groupField=true&queryFields=iri";

                    logger.log("debug", `Looking for term [${termUri}] in OLS.`);
                    request(url, (error, Response, body) => {
                        let jsonBody = JSON.parse(body);

                        if (jsonBody.response.numFound === 1) {
                            logger.log("debug", "Found 1 match!");
                            resolve(true);
                        } else if (jsonBody.response.numFound === 0) {
                            logger.log("debug", "Could not find term in OLS.");
                            errors.push(generateErrorObject(`provided term does not exist in OLS: [${termUri}]`,{keyword: "isValidTerm"}));
                            reject(new ajv.ValidationError(errors));
                        } else {
                            errors.push(generateErrorObject("Something went wrong while validating term, try again.", {keyword: "isValidTerm"}));
                            reject(new ajv.ValidationError(errors));
                        }
                    });
                } else {
                    resolve(true);
                }
            });
        };

        return findTerm;
    }
}

export default IsValidTerm;