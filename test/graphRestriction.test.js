const fs = require("fs");
const ElixirValidator = require('../src/elixir-validator');
const GraphRestriction = require('../src/keywords/graph_restriction');


test(" -> graphRestriction Schema", () => {
    let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
    let jsonSchema = JSON.parse(inputSchema);

    let inputObj = fs.readFileSync("examples/objects/graphRestriction_pass.json");
    let jsonObj = JSON.parse(inputObj);

    const ingestValidator = new ElixirValidator([GraphRestriction]);

    return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
        expect(data).toBeDefined();
    });

});

test(" -> graphRestriction Schema", () => {
    let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
    let jsonSchema = JSON.parse(inputSchema);

    let inputObj = fs.readFileSync("examples/objects/graphRestriction_normal.json");
    let jsonObj = JSON.parse(inputObj);

    const ingestValidator = new ElixirValidator([GraphRestriction]);

    return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
        expect(data).toBeDefined();
    });
});

test(" -> graphRestriction Schema", () => {
    let inputSchema = fs.readFileSync("examples/schemas/graphRestriction-schema.json");
    let jsonSchema = JSON.parse(inputSchema);

    let inputObj = fs.readFileSync("examples/objects/graphRestriction_fail.json");
    let jsonObj = JSON.parse(inputObj);

    const ingestValidator = new ElixirValidator([GraphRestriction]);

    return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
        expect(data).toBeDefined();
        expect(data.validationErrors.length).toBe(1);
        expect(data.validationErrors[0].userFriendlyMessage).toContain('Provided term is not child of');

    });
});
