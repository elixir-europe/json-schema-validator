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
var IsValidTerm = /** @class */ (function () {
    function IsValidTerm(olsSearchUrl, keywordName) {
        this.keywordName = keywordName ? keywordName : "isValidTerm";
        this.olsSearchUrl = olsSearchUrl;
    }
    IsValidTerm.prototype.configure = function (ajv) {
        var keywordDefinition = {
            async: this.isAsync(),
            type: "string",
            validate: this.generateKeywordFunction(),
            errors: true
        };
        return ajv.addKeyword(this.keywordName, keywordDefinition);
    };
    IsValidTerm.prototype.keywordFunction = function () {
        return this.generateKeywordFunction();
    };
    IsValidTerm.prototype.isAsync = function () {
        return true;
    };
    IsValidTerm.prototype.generateKeywordFunction = function () {
        var _this = this;
        var generateErrorObject = function (message) {
            return {
                keyword: _this.keywordName,
                message: message,
                dataPath: "",
                schemaPath: "",
                params: {}
            };
        };
        var findTerm = function (schema, data) {
            return new Promise(function (resolve, reject) {
                if (schema) {
                    var errors_1 = [];
                    var termUri_1 = data;
                    var encodedTermUri = encodeURIComponent(termUri_1);
                    var url = _this.olsSearchUrl + encodedTermUri + "&exact=true&groupField=true&queryFields=iri";
                    winston_1.default.log("debug", "Looking for term [" + termUri_1 + "] in OLS.");
                    request_promise_1.default(url, function (error, Response, body) {
                        var jsonBody = JSON.parse(body);
                        if (jsonBody.response.numFound === 1) {
                            winston_1.default.log("debug", "Found 1 match!");
                            resolve(true);
                        }
                        else if (jsonBody.response.numFound === 0) {
                            winston_1.default.log("debug", "Could not find term in OLS.");
                            errors_1.push(generateErrorObject("provided term does not exist in OLS: [" + termUri_1 + "]", { keyword: "isValidTerm" }));
                            reject(new ajv.ValidationError(errors_1));
                        }
                        else {
                            errors_1.push(generateErrorObject("Something went wrong while validating term, try again.", { keyword: "isValidTerm" }));
                            reject(new ajv.ValidationError(errors_1));
                        }
                    });
                }
                else {
                    resolve(true);
                }
            });
        };
        return findTerm;
    };
    return IsValidTerm;
}());
exports.default = IsValidTerm;
