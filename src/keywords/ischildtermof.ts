import {Ajv, ErrorObject, SchemaValidateFunction} from "ajv";
import * as ajv from "ajv";
import request from "request-promise";
import logger from "../winston";
import {CustomAjvKeyword} from "../common/interfaces";

class IsChildTermOf implements CustomAjvKeyword {
  keywordName: string;
  olsSearchUrl: string;

  constructor(olsSearchUrl: string, keywordName?: string) {
      this.keywordName = keywordName ? keywordName : "isChildTermOf";
      this.olsSearchUrl = olsSearchUrl;
  }

  configure(ajv: Ajv): Ajv {
      const keywordDefinition= {
          async: this.isAsync(),
          type: "string",
          validate: this.generateKeywordFunction(),
          errors: true
      };

      return ajv.addKeyword(this.keywordName, keywordDefinition);
  }

  keywordFunction(): SchemaValidateFunction {
      return this.generateKeywordFunction();
  }

  isAsync(): boolean {
      return true;
  }

  generateKeywordFunction(): SchemaValidateFunction {

      const generateErrorObject: (message: string, dataPath?: string, params?: any) => ErrorObject = (message, dataPath, params) => {
          return {
              keyword: this.keywordName,
              dataPath: dataPath? dataPath : "",
              message: message,
              schemaPath: "",
              params: params
          };
      };

      const findChildTerm: SchemaValidateFunction = (schema: any, data: any, parentSchema?: object, dataPath?: string,
                                                     parentData?: object | Array<any>, parentDataProperty?: string | number,
                                                     rootData?: object | Array<any>) => {
        return new Promise((resolve, reject) => {
          const parentTerm = schema.parentTerm;
          const ontologyId = schema.ontologyId;
          let errors: ErrorObject[] = [];
    
          if(parentTerm && ontologyId) {    
            const termUri = encodeURIComponent(data);
            const url = this.olsSearchUrl + termUri
            + "&exact=true&groupField=true&allChildrenOf=" + encodeURIComponent(parentTerm)
            + "&ontology=" + ontologyId + "&queryFields=iri";
    
            logger.log("debug", `Evaluating isChildTermOf, query url: [${url}]`);
            request(url, (error, response, body) => {
              let jsonBody = JSON.parse(body);
    
              if(jsonBody.response.numFound === 1) {
                logger.log("debug", "It's a child term!");
                resolve(true);
              } else if(jsonBody.response.numFound === 0) {
                logger.log("debug", `Provided term is not child of [${parentTerm}]`);
                errors.push(generateErrorObject(`Provided term is not child of [${parentTerm}]`, dataPath,{keyword: "isChildTermOf"}));
                reject(new ajv.ValidationError(errors));
              } else {
                errors.push(generateErrorObject("Something went wrong while validating term, try again.", dataPath,{keyword: "isChildTermOf"}));
                reject(new ajv.ValidationError(errors));
              }
            });
          } else {
            errors.push(generateErrorObject(
                "Missing required variable in schema isChildTermOf, required properties are: parentTerm and ontologyId.",
                dataPath,
                {keyword: "isChildTermOf"}
                )
            );
            reject(new ajv.ValidationError(errors));
          }
        });
      };

      return findChildTerm;
  }
}

export default IsChildTermOf;
