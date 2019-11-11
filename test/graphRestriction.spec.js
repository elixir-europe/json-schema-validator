"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
var graph_restriction_1 = __importDefault(require("../src/keywords/graph_restriction"));
describe("Graph validation tests", function () {
    test(" -> graphRestriction 1 Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/graphRestriction-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/graphRestriction_pass.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var ingestValidator = new elixir_validator_1.default([new graph_restriction_1.default("https://www.ebi.ac.uk/ols/api")]);
        return ingestValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
        });
    });
    test(" -> graphRestriction 2 Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/graphRestriction-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/graphRestriction_normal.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var ingestValidator = new elixir_validator_1.default([new graph_restriction_1.default("https://www.ebi.ac.uk/ols/api")]);
        return ingestValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
        });
    });
    test(" -> graphRestriction 3 Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/graphRestriction-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/graphRestriction_fail.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var ingestValidator = new elixir_validator_1.default([new graph_restriction_1.default("https://www.ebi.ac.uk/ols/api")]);
        return ingestValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain('Provided term is not child of');
        });
    });
});
