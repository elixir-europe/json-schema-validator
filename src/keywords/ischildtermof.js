"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ajv = __importStar(require("ajv"));
var request_promise_1 = __importDefault(require("request-promise"));
var winston_1 = __importDefault(require("../winston"));
var IsChildTermOf = /** @class */ (function () {
    function IsChildTermOf(olsSearchUrl, keywordName) {
        this.keywordName = keywordName ? keywordName : "isChildTermOf";
        this.olsSearchUrl = olsSearchUrl;
    }
    IsChildTermOf.prototype.configure = function (ajv) {
        var keywordDefinition = {
            async: this.isAsync(),
            type: "string",
            validate: this.generateKeywordFunction(),
            errors: true
        };
        return ajv.addKeyword(this.keywordName, keywordDefinition);
    };
    IsChildTermOf.prototype.keywordFunction = function () {
        return this.generateKeywordFunction();
    };
    IsChildTermOf.prototype.isAsync = function () {
        return true;
    };
    IsChildTermOf.prototype.generateKeywordFunction = function () {
        var _this = this;
        var generateErrorObject = function (message, dataPath, params) {
            return {
                keyword: _this.keywordName,
                dataPath: dataPath ? dataPath : "",
                message: message,
                schemaPath: "",
                params: params
            };
        };
        var findChildTerm = function (schema, data, parentSchema, dataPath, parentData, parentDataProperty, rootData) {
            return new Promise(function (resolve, reject) {
                var parentTerm = schema.parentTerm;
                var ontologyId = schema.ontologyId;
                var errors = [];
                if (parentTerm && ontologyId) {
                    var termUri = encodeURIComponent(data);
                    var url = _this.olsSearchUrl + termUri
                        + "&exact=true&groupField=true&allChildrenOf=" + encodeURIComponent(parentTerm)
                        + "&ontology=" + ontologyId + "&queryFields=iri";
                    winston_1.default.log("debug", "Evaluating isChildTermOf, query url: [" + url + "]");
                    request_promise_1.default(url, function (error, response, body) {
                        var jsonBody = JSON.parse(body);
                        if (jsonBody.response.numFound === 1) {
                            winston_1.default.log("debug", "It's a child term!");
                            resolve(true);
                        }
                        else if (jsonBody.response.numFound === 0) {
                            winston_1.default.log("debug", "Provided term is not child of [" + parentTerm + "]");
                            errors.push(generateErrorObject("Provided term is not child of [" + parentTerm + "]", dataPath, { keyword: "isChildTermOf" }));
                            reject(new ajv.ValidationError(errors));
                        }
                        else {
                            errors.push(generateErrorObject("Something went wrong while validating term, try again.", dataPath, { keyword: "isChildTermOf" }));
                            reject(new ajv.ValidationError(errors));
                        }
                    });
                }
                else {
                    errors.push(generateErrorObject("Missing required variable in schema isChildTermOf, required properties are: parentTerm and ontologyId.", dataPath, { keyword: "isChildTermOf" }));
                    reject(new ajv.ValidationError(errors));
                }
            });
        };
        return findChildTerm;
    };
    return IsChildTermOf;
}());
exports.default = IsChildTermOf;
