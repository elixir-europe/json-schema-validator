import {Ajv, ErrorObject} from "ajv";

namespace ts {
    export interface IElixirValidator {
        validate(inputSchema: any, inputDocument: any): PromiseLike<ErrorObject[]>
    }

    export interface Json {
        [x: string]: string | number | boolean | Date | Json | JsonArray;
    }

    export interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> { }

    export interface CustomAjvKeyword {
        configure(ajv: Ajv) : Ajv;
        keywordFunction() : Function;
        isAsync() : Boolean;
    }
}

export = ts;