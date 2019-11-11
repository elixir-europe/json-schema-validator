"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
var ischildtermof_1 = __importDefault(require("../src/keywords/ischildtermof"));
describe("Async validations tests", function () {
    test(" -> isChildTermOf Schema", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/isChildTerm-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/isChildTerm.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].dataPath).toBe(".attributes['age'][0].terms[0].url");
        });
    });
    test("FAANG Schema - FAANG \'organism\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-organism-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("FAANG Schema - \'specimen\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-specimen-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("FAANG Schema - \'pool of specimens\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-poolOfSpecimens-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("FAANG Schema - \'cell specimen\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-cellSpecimen-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("FAANG Schema - \'cell culture\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-cellCulture-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("FAANG Schema - \'cell line\' sample", function () {
        var inputSchema = fs_1.default.readFileSync("examples/schemas/faang-schema.json");
        var jsonSchema = JSON.parse(inputSchema.toString());
        var inputObj = fs_1.default.readFileSync("examples/objects/faang-cellLine-sample.json");
        var jsonObj = JSON.parse(inputObj.toString());
        var elixirValidator = new elixir_validator_1.default([new ischildtermof_1.default('https://www.ebi.ac.uk/ols/api/search?q=')]);
        return elixirValidator.validate(jsonSchema, jsonObj).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
});
//This test uses resources from the file system.
//And we dont expect a scenario like this to happen in production ever.
//So unless the test is fixed, this would never pass on any environment.
// test("Test HCA data", () => {
//     let inputSchema = fs.readFileSync("examples/schemas/analysis_process.json");
//     let jsonSchema = JSON.parse(inputSchema);
//     let inputObj = fs.readFileSync("examples/objects/test_pass_new_analysis_process.json");
//     let jsonObj = JSON.parse(inputObj);
//     const elixirValidator = new ElixirValidator(
//         [new IsChildTerm(null, 'https://www.ebi.ac.uk/ols/api/search?q=')],
//         {baseSchemaPath: '/Users/jupp/dev/hca/metadata-schema/json_schema'});
//     return elixirValidator.validate(jsonSchema, jsonObj).then( (data) => {
//         expect(data).toBeDefined();
//         expect(data.length).toBe(4);
//     });
// });
