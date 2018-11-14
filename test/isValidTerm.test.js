const fs = require("fs");
const ElixirValidator = require('../src/elixir-validator');
const IsValidTerm = require('../src/keywords/isvalidterm');

test("isValidTerm", () => {
  let inputSchema = fs.readFileSync("examples/schemas/isValidTerm-schema.json");
  let jsonSchema = JSON.parse(inputSchema);

  let inputObj = fs.readFileSync("examples/objects/isValidTerm.json");
  let jsonObj = JSON.parse(inputObj);

  const ingestValidator = new ElixirValidator([IsValidTerm]);

  return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
        expect(data).toBeDefined();
        expect(data.validationErrors.length).toBe(1);
        expect(data.validationErrors[0].userFriendlyMessage).toContain('provided term does not exist in OLS');

    });
});