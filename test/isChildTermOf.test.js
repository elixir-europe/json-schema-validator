const fs = require("fs");
const ElixirValidator = require('../src/elixir-validator');
const IsChildTermOf = require('../src/keywords/ischildtermof');

test("isChildTermOf", () => {
  let inputSchema = fs.readFileSync("examples/schemas/isChildTerm-schema.json");
  let jsonSchema = JSON.parse(inputSchema);

  let inputObj = fs.readFileSync("examples/objects/isChildTerm.json");
  let jsonObj = JSON.parse(inputObj);



  const ingestValidator = new ElixirValidator([new IsChildTermOf(null, "https://www.ebi.ac.uk/ols/api/search?q=")]);

  return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
        expect(data).toBeDefined();
        expect(data.length).toBe(1);
        expect(data[0].message).toContain('Provided term is not child of');

    });
});