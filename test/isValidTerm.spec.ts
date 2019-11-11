import fs from "fs";
import ElixirValidator from "../src/elixir-validator";
import IsValidTerm from "../src/keywords/isvalidterm";

describe("IsValidTerm tests", () => {
  test("isValidTerm", () => {
    const inputSchema = fs.readFileSync("examples/schemas/isValidTerm-schema.json");
    const jsonSchema = JSON.parse(inputSchema.toString());

    const inputObj = fs.readFileSync("examples/objects/isValidTerm.json");
    const jsonObj = JSON.parse(inputObj.toString());

    const ingestValidator = new ElixirValidator([new IsValidTerm('https://www.ebi.ac.uk/ols/api/search?q=')]);

    return ingestValidator.validate(jsonSchema, jsonObj).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
      expect(data[0].message).toContain('provided term does not exist in OLS');
    });
  });
});