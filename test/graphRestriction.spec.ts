import fs from "fs";
import ElixirValidator from "../src/elixir-validator";
import GraphRestriction from "../src/keywords/graph_restriction";

describe("Graph validation tests", () => {
    test(" -> graphRestriction 1 Schema", () => {
        let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
        let jsonSchema = JSON.parse(inputSchema.toString());

        let inputObj = fs.readFileSync("examples/objects/graphRestriction_pass.json");
        let jsonObj = JSON.parse(inputObj.toString());

        const ingestValidator = new ElixirValidator([new GraphRestriction("https://www.ebi.ac.uk/ols/api")]);

        return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
            expect(data).toBeDefined();
        });

    });

    test(" -> graphRestriction 2 Schema", () => {
        let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
        let jsonSchema = JSON.parse(inputSchema.toString());

        let inputObj = fs.readFileSync("examples/objects/graphRestriction_normal.json");
        let jsonObj = JSON.parse(inputObj.toString());


        const ingestValidator = new ElixirValidator([new GraphRestriction("https://www.ebi.ac.uk/ols/api")]);

        return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
            expect(data).toBeDefined();
        });
    });

    test(" -> graphRestriction 3 Schema", () => {
        let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
        let jsonSchema = JSON.parse(inputSchema.toString());

        let inputObj = fs.readFileSync("examples/objects/graphRestriction_fail.json");
        let jsonObj = JSON.parse(inputObj.toString());


        const ingestValidator = new ElixirValidator([new GraphRestriction("https://www.ebi.ac.uk/ols/api")]);

        return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
            expect(data).toBeDefined();
            expect(data.length).toBe(1);
            expect(data[0].message).toContain('Provided term is not child of');

        });
    });

});