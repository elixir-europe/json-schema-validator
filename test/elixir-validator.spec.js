"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
describe("Elixir validator tests", function () {
    test("Empty Schema (empty object)", function () {
        var ingestValidator = new elixir_validator_1.default([]);
        return ingestValidator.validate({}, {}).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("Attributes Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/attributes-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/attributes.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain('should match format "uri"');
        });
    });
    test("BioSamples Schema - FAANG \'organism\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/biosamples-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-organism-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("Study Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/submittables/study-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/study.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(2);
        });
    });
});
