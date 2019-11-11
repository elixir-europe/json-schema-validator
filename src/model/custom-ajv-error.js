"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomAjvError = /** @class */ (function () {
    function CustomAjvError(keyword, message, params) {
        this.keyword = keyword;
        this.message = message;
        this.params = params;
    }
    return CustomAjvError;
}());
exports.default = CustomAjvError;
