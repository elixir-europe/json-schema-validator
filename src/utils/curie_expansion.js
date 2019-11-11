"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_promise_1 = __importDefault(require("request-promise"));
var bluebird_1 = __importDefault(require("bluebird"));
var CurieExpansion = /** @class */ (function () {
    function CurieExpansion(olsSearchUrl) {
        this.olsSearchUrl = olsSearchUrl;
        this.cachedOlsCurieResponses = {};
    }
    CurieExpansion.isCurie = function (term) {
        var curie = true;
        if (term.split(":").length !== 2 || term.includes("http")) {
            curie = false;
        }
        return curie;
    };
    CurieExpansion.prototype.expandCurie = function (term) {
        var _this = this;
        var termUri = encodeURIComponent(term);
        var url = this.olsSearchUrl + termUri
            + "&exact=true&groupField=true&queryFields=obo_id";
        return new bluebird_1.default(function (resolve, reject) {
            var curieExpandResponsePromise = null;
            if (_this.cachedOlsCurieResponses[url]) {
                curieExpandResponsePromise = bluebird_1.default.resolve(_this.cachedOlsCurieResponses[url]);
            }
            else {
                curieExpandResponsePromise = request_promise_1.default({
                    method: "GET",
                    url: url,
                    json: true
                }).promise();
            }
            curieExpandResponsePromise
                .then(function (resp) {
                _this.cachedOlsCurieResponses[url] = resp;
                var jsonBody = resp;
                if (jsonBody.response.numFound === 1) {
                    resolve(jsonBody.response.docs[0].iri);
                }
                else {
                    reject("Could not retrieve IRI for " + term);
                }
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    return CurieExpansion;
}());
exports.default = CurieExpansion;
