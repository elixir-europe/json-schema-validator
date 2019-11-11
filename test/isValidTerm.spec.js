"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
var isvalidterm_1 = __importDefault(require("../src/keywords/isvalidterm"));
describe("IsValidTerm tests", function () {
    test("isValidTerm", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/isValidTerm-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/isValidTerm.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var ingestValidator = new elixir_validator_1.default([new isvalidterm_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return ingestValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain('provided term does not exist in OLS');
        });
    });
});
