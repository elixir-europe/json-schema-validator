"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var elixir_validator_1 = __importDefault(require("../src/elixir-validator"));
jest.setTimeout(30000);
describe("Very large schemas tests", function () {
    test("HCA ref schema, species and restriction schema test very large schema no errors", function () {
        var hcaSchemas = fs_1.default.readFileSync("examples/schemas/references/hca_donor_organism.json");
        var jsonHcaSchemas = JSON.parse(hcaSchemas.toString());
        var elixirValidator = new elixir_validator_1.default([]);
        return elixirValidator.validate(jsonHcaSchemas, {
            "describedBy": "https://schema.dev.data.humancellatlas.org/type/biomaterial/8.2.7/donor_organism",
            "schema_type": "biomaterial",
            "biomaterial_core": {
                "biomaterial_id": "d1",
                "biomaterial_name": "donor1",
                "ncbi_taxon_id": [
                    9606
                ]
            },
            "is_living": "yes",
            "biological_sex": "male",
            "development_stage": {
                "text": "adult",
                "ontology": "EFO:0001272"
            },
            "genus_species": [
                {
                    "text": "Homo sapiens",
                    "ontology": "NCBITAXON:9606"
                }
            ]
        }).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(0);
        });
    });
    test("HCA ref schema, species and restriction schema test very large schema no errors", function () {
        var hcaSchemas = fs_1.default.readFileSync("examples/schemas/references/hca_donor_organism.json");
        var jsonHcaSchemas = JSON.parse(hcaSchemas.toString());
        var elixirValidator = new elixir_validator_1.default([]);
        return elixirValidator.validate(jsonHcaSchemas, {
            "describedBy": "https://schema.dev.data.humancellatlas.org/type/biomaterial/8.2.7/donor_organism",
            "schema_type": "biomaterial",
            "biomaterial_core": {
                "biomaterial_name": "donor1",
                "ncbi_taxon_id": [
                    9606
                ]
            },
            "is_living": "yes",
            "biological_sex": "male",
            "development_stage": {
                "text": "adult",
                "ontology": "EFO:0001272"
            },
            "genus_species": [
                {
                    "text": "Homo sapiens",
                    "ontology": "NCBITAXON:9606"
                }
            ]
        }).then(function (data) {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain("biomaterial_id");
        });
    });
});
