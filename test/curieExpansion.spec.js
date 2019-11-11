"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var curie_expansion_1 = __importDefault(require("../src/utils/curie_expansion"));
describe("Curie expansion tests", function () {
    test("Curie expansion with no errors", function () {
        var curieExpansion = new curie_expansion_1.default("https://www.ebi.ac.uk/ols/api/search?q=");
        var curie = "EFO:0000399";
        var isCurie = curie_expansion_1.default.isCurie(curie);
        expect(isCurie).toBe(true);
        // const uri = curieExpansion.expandCurie(curie)
        // expect(uri).toBe("http://www.ebi.ac.uk/efo/EFO_0000399");
        return curieExpansion.expandCurie(curie).then(function (uri) {
            expect(uri).toBe("http://www.ebi.ac.uk/efo/EFO_0000399");
        });
    });
});
