import {CustomAjvKeyword} from "../common/interfaces";

import CurieExpansion from "../utils/curie_expansion";
import ajv, {Ajv, ErrorObject, SchemaValidateFunction} from "ajv";
import request from "request-promise";
import Promise from "bluebird";

class GraphRestriction implements CustomAjvKeyword {
    keywordName: string;
    olsBaseUrl: string;
    constructor(olsBaseUrl: string, keywordName?: string){
        this.keywordName = keywordName ? keywordName : "graph_restriction";
        this.olsBaseUrl = olsBaseUrl;
    }

    /**
     *
     * Given an AJV validator, returns the validator with the graph-restriction keyword applied
     *
     * @param ajv
     */
    configure(ajv: Ajv) {
        const keywordDefinition= {
            async: GraphRestriction._isAsync(),
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
        return GraphRestriction._isAsync();
    }

    static _isAsync(): boolean{
        return true;
    }

    generateKeywordFunction(): SchemaValidateFunction{

        const olsSearchUrl = `${this.olsBaseUrl}/search?q=`;
        const cachedOlsResponses: Record<string, any> = {};
        const curieExpansion = new CurieExpansion(olsSearchUrl);

        const callCurieExpansion = (terms: string[]) => {
            let expanded = terms.map((t) => {
                if (CurieExpansion.isCurie(t)){
                    return curieExpansion.expandCurie(t);
                }
                else {
                    return t
                }
            });

            return Promise.all(expanded);
        };

        const generateErrorObject: (message: string) => ErrorObject = (message) => {
            return {
                keyword: this.keywordName,
                message: message,
                dataPath: "",
                schemaPath: "",
                params: {}
            };
        };

        const findChildTerm = (schema: any, data: any) => {
            return new Promise((resolve, reject) => {
                let parentTerms = schema.classes;
                const ontologyIds = schema.ontologies;
                let errors: ErrorObject[] = [];

                if(parentTerms && ontologyIds) {
                    if(schema.include_self === true && parentTerms.includes(data)){
                        resolve(data);
                    }
                    else {
                        callCurieExpansion(parentTerms).then((iris) => {

                            const parentTerm = iris.join(",");
                            const ontologyId = ontologyIds.join(",").replace(/obo:/g, "");

                            const termUri = encodeURIComponent(data);
                            const url = olsSearchUrl + termUri
                                + "&exact=true&groupField=true&allChildrenOf=" + encodeURIComponent(parentTerm)
                                + "&ontology=" + ontologyId + "&queryFields=obo_id";

                            let olsResponsePromise: Promise<any>;
                            if(cachedOlsResponses[url]) {
                                olsResponsePromise = Promise.resolve(cachedOlsResponses[url]);
                            }
                            else {
                                olsResponsePromise = Promise.resolve(
                                    request({
                                        method: "GET",
                                        url: url,
                                        json: true
                                    })
                                );
                            }

                            olsResponsePromise.then((resp) => {
                                cachedOlsResponses[url] = resp;
                                let jsonBody = resp;

                                if (jsonBody.response.numFound === 1) {
                                } else if (jsonBody.response.numFound === 0) {
                                    errors.push(generateErrorObject(`Provided term is not child of [${parentTerm}]`));
                                } else {
                                    errors.push(generateErrorObject("Something went wrong while validating term, try again."));
                                }
                                reject(new ajv.ValidationError(errors));
                            });
                        }).catch(err => {
                            errors.push(generateErrorObject(err));
                            reject(new ajv.ValidationError(errors));
                        });
                    }
                }
                else {
                    errors.push(generateErrorObject("Missing required variable in schema graph_restriction, required properties are: parentTerm and ontologyId."));
                    reject(ajv.ValidationError);
                }
            });
        };

        return findChildTerm;
    }
}

export default GraphRestriction;