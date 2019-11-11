"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
var ischildtermof_1 = __importDefault(require("../src/keywords/ischildtermof"));
describe("IsChildTermOf tests", function () {
    test("isChildTermOf", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/isChildTerm-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/isChildTerm.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var ingestValidator = new elixir_validator_1.default([new ischildtermof_1.default("https://www.ebi.ac.uk/ols/api/search?q=")]);
        return ingestValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain('Provided term is not child of');
        });
    });
});
