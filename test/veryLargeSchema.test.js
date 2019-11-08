const fs = require("fs");
const ElixirValidator = require('../src/elixir-validator');
jest.setTimeout(30000);

test("HCA ref schema, species and restriction schema test very large schema no errors", () => {
    let hcaSchemas = fs.readFileSync("examples/schemas/references/hca_donor_organism.json");
    let jsonHcaSchemas = JSON.parse(hcaSchemas);

    const elixirValidator = new ElixirValidator([]);

    return elixirValidator.validate(
        jsonHcaSchemas,
        {
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
            ]        }
    ).then( (data) => {
        expect(data).toBeDefined();
        expect(data.length).toBe(0);
    });
});

test("HCA ref schema, species and restriction schema test very large schema no errors", () => {
    let hcaSchemas = fs.readFileSync("examples/schemas/references/hca_donor_organism.json");
    let jsonHcaSchemas = JSON.parse(hcaSchemas);

    const elixirValidator = new ElixirValidator([]);

    return elixirValidator.validate(
        jsonHcaSchemas,
        {
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
            ]        }
    ).then( (data) => {
        expect(data).toBeDefined();
        expect(data.length).toBe(1);
        expect(data[0].message).toContain("biomaterial_id")
    });
});

