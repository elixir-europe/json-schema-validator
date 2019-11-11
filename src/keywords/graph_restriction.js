"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var curie_expansion_1 = __importDefault(require("../utils/curie_expansion"));
var ajv_1 = __importDefault(require("ajv"));
var request_promise_1 = __importDefault(require("request-promise"));
var bluebird_1 = __importDefault(require("bluebird"));
var GraphRestriction = /** @class */ (function () {
    function GraphRestriction(olsBaseUrl, keywordName) {
        this.keywordName = keywordName ? keywordName : "graph_restriction";
        this.olsBaseUrl = olsBaseUrl;
    }
    /**
     *
     * Given an AJV validator, returns the validator with the graph-restriction keyword applied
     *
     * @param ajv
     */
    GraphRestriction.prototype.configure = function (ajv) {
        var keywordDefinition = {
            async: GraphRestriction._isAsync(),
            type: "string",
            validate: this.generateKeywordFunction(),
            errors: true
        };
        return ajv.addKeyword(this.keywordName, keywordDefinition);
    };
    GraphRestriction.prototype.keywordFunction = function () {
        return this.generateKeywordFunction();
    };
    GraphRestriction.prototype.isAsync = function () {
        return GraphRestriction._isAsync();
    };
    GraphRestriction._isAsync = function () {
        return true;
    };
    GraphRestriction.prototype.generateKeywordFunction = function () {
        var _this = this;
        var olsSearchUrl = this.olsBaseUrl + "/search?q=";
        var cachedOlsResponses = {};
        var curieExpansion = new curie_expansion_1.default(olsSearchUrl);
        var callCurieExpansion = function (terms) {
            var expanded = terms.map(function (t) {
                if (curie_expansion_1.default.isCurie(t)) {
                    return curieExpansion.expandCurie(t);
                }
                else {
                    return t;
                }
            });
            return bluebird_1.default.all(expanded);
        };
        var generateErrorObject = function (message) {
            return {
                keyword: _this.keywordName,
                message: message,
                dataPath: "",
                schemaPath: "",
                params: {}
            };
        };
        var findChildTerm = function (schema, data) {
            return new bluebird_1.default(function (resolve, reject) {
                var parentTerms = schema.classes;
                var ontologyIds = schema.ontologies;
                var errors = [];
                if (parentTerms && ontologyIds) {
                    if (schema.include_self === true && parentTerms.includes(data)) {
                        resolve(data);
                    }
                    else {
                        callCurieExpansion(parentTerms).then(function (iris) {
                            var parentTerm = iris.join(",");
                            var ontologyId = ontologyIds.join(",").replace(/obo:/g, "");
                            var termUri = encodeURIComponent(data);
                            var url = olsSearchUrl + termUri
                                + "&exact=true&groupField=true&allChildrenOf=" + encodeURIComponent(parentTerm)
                                + "&ontology=" + ontologyId + "&queryFields=obo_id";
                            var olsResponsePromise;
                            if (cachedOlsResponses[url]) {
                                olsResponsePromise = bluebird_1.default.resolve(cachedOlsResponses[url]);
                            }
                            else {
                                olsResponsePromise = bluebird_1.default.resolve(request_promise_1.default({
                                    method: "GET",
                                    url: url,
                                    json: true
                                }));
                            }
                            olsResponsePromise.then(function (resp) {
                                cachedOlsResponses[url] = resp;
                                var jsonBody = resp;
                                if (jsonBody.response.numFound === 1) {
                                }
                                else if (jsonBody.response.numFound === 0) {
                                    errors.push(generateErrorObject("Provided term is not child of [" + parentTerm + "]"));
                                }
                                else {
                                    errors.push(generateErrorObject("Something went wrong while validating term, try again."));
                                }
                                reject(new ajv_1.default.ValidationError(errors));
                            });
                        }).catch(function (err) {
                            errors.push(generateErrorObject(err));
                            reject(new ajv_1.default.ValidationError(errors));
                        });
                    }
                }
                else {
                    errors.push(generateErrorObject("Missing required variable in schema graph_restriction, required properties are: parentTerm and ontologyId."));
                    reject(ajv_1.default.ValidationError);
                }
            });
        };
        return findChildTerm;
    };
    return GraphRestriction;
}());
exports.default = GraphRestriction;
