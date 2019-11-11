import fs from "fs";
import ElixirValidator from "../src/elixir-validator";
import IsChildTermOf from "../src/keywords/ischildtermof";

describe("IsChildTermOf tests", () => {
  test("isChildTermOf", () => {
    let inputSchema = fs.readFileSync("examples/schemas/isChildTerm-schema.json");
    let jsonSchema = JSON.parse(inputSchema.toString());

    let inputObj = fs.readFileSync("examples/objects/isChildTerm.json");
    let jsonObj = JSON.parse(inputObj.toString());



    const ingestValidator = new ElixirValidator([new IsChildTermOf("https://www.ebi.ac.uk/ols/api/search?q=")]);

    return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].message).toContain('Provided term is not child of');
    });
  });
});