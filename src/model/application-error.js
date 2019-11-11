"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AppError = /** @class */ (function () {
    function AppError(errorString) {
        this.errors = errorString;
    }
    return AppError;
}());
exports.default = AppError;
