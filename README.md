# JSON Schema Validator
[![Build Status](https://travis-ci.org/EMBL-EBI-SUBS/json-schema-validator.svg?branch=master)](https://travis-ci.org/EMBL-EBI-SUBS/json-schema-validator)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

This repository contains a [JSON Schema](http://json-schema.org/) validator that includes custom extensions of life science data.
This package contains only a library for schema validation. You can use it as a dependency to set up and run it as a [Node.js](https://nodejs.org/en/) server that receives validation requests and gives back results.
The validation is done using the [AJV](https://github.com/epoberezkin/ajv) library version ^6.0.0 that fully supports the JSON Schema **draft-07**.


## Contents
- [Installation](README.md#installation)

- [Usage](README.md#usage)

- [Custom keywords](README.md#custom-keywords)

- [Existing usage of this library](README.md#existing-usage-of-this-library)

- [License](README.md#license)

## Installation

`npm install elixir-jsonschema-validator`

### Usage

```js
let { ElixirValidator} = require('elixir-jsonschema-validator');
let jsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type:"object",
    properties: {
        alias: {
         description: "A sample unique identifier in a submission.",
            type: "string"
        }
    },
    required: ["alias"]
};

let jsonObj = { alias : "MTB1"};
let validator = new ElixirValidator();
validator.validate(jsonSchema, jsonObj).then((validationResult) => {
    console.log(validationResult.validationState)
    for ( let errors of validationResult.validationErrors) {
        console.log(errors.userFriendlyMessage)
    }
});
```

## Custom keywords
The AJV library supports the implementation of custom json schema keywords to address validation scenarios that go beyond what json schema can handle.
This validator has four custom keywords implemented: `graph_restriction`, `isChildTermOf`, `isValidTerm` and `isValidTaxonomy`.

Pick the custom keywords you want to support and add them to the Elixir validator:

```js
// get all the custom extensions
let { ElixirValidator, GraphRestriction, IsChildTermOf, IsValidTerm, isValidTaxonomy]} = require('elixir-jsonschema-validator');
// only use the graph_extension keyword
let validator = new ElixirValidator([GraphRestriction])
```

### graph_restriction


This custom keyword *evaluates if an ontology term is child of another*. This keyword is applied to a string (CURIE) and **passes validation if the term is a child of the term defined in the schema**.
The keyword requires one or more **parent terms** *(classes)* and **ontology ids** *(ontologies)*, both of which should exist in [OLS - Ontology Lookup Service](https://www.ebi.ac.uk/ols).

This keyword works by doing an asynchronous call to the [OLS API](https://www.ebi.ac.uk/ols/api/) that will respond with the required information to know if a given term is child of another.
Being an async validation step, whenever used in a schema, the schema must have the flag: `"$async": true` in its object root.


#### Usage
Schema:
```js
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://schema.dev.data.humancellatlas.org/module/ontology/5.3.0/organ_ontology",
    "$async": true,
    "properties": {
        "ontology": {
            "description": "A term from the ontology [UBERON](https://www.ebi.ac.uk/ols/ontologies/uberon) for an organ or a cellular bodily fluid such as blood or lymph.",
            "type": "string",
            "graph_restriction":  {
                "ontologies" : ["obo:hcao", "obo:uberon"],
                "classes": ["UBERON:0000062","UBERON:0000179"],
                "relations": ["rdfs:subClassOf"],
                "direct": false,
                "include_self": false
            }
        }
    }
}
```
JSON object:
```js
{
    "ontology": "UBERON:0000955"
}
```


### isChildTermOf
This custom keyword also *evaluates if an ontology term is child of another* and is a simplified version of the graph_restriction keyword. This keyword is applied to a string (url) and **passes validation if the term is a child of the term defined in the schema**.
The keyword requires the **parent term** and the **ontology id**, both of which should exist in [OLS - Ontology Lookup Service](https://www.ebi.ac.uk/ols).

This keyword works by doing an asynchronous call to the [OLS API](https://www.ebi.ac.uk/ols/api/) that will respond with the required information to know if a given term is child of another.
Being an async validation step, whenever used in a schema, the schema must have the flag: `"$async": true` in its object root.

#### Usage
Schema:
```js
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$async": true,
  "properties": {
    "term": {
      "type": "string",
      "format": "uri",
      "isChildTermOf": {
        "parentTerm": "http://purl.obolibrary.org/obo/PATO_0000047",
        "ontologyId": "pato"
      }
    }
  }
}
```
JSON object:
```js
{
  "term": "http://purl.obolibrary.org/obo/PATO_0000383"
}
```

### isValidTerm
This custom keyword *evaluates if a given ontology term url exists in OLS* ([Ontology Lookup Service](https://www.ebi.ac.uk/ols)). It is applied to a string (url) and **passes validation if the term exists in OLS**. It can be aplied to any string defined in the schema.

This keyword works by doing an asynchronous call to the [OLS API](https://www.ebi.ac.uk/ols/api/) that will respond with the required information to determine if the term exists in OLS or not.
Being an async validation step, whenever used in a schema, the schema must have the flag: `"$async": true` in its object root.

#### Usage
Schema:
```js
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$async": true,

  "properties": {
    "url": {
      "type": "string",
      "format": "uri",
      "isValidTerm": true
    }
  }
}
```
JSON object:
```js
{
  "url": "http://purl.obolibrary.org/obo/PATO_0000383"
}
```

### isValidTaxonomy

This custom keyword evaluates if a given *taxonomy* exists in ENA's Taxonomy Browser. It is applied to a string (url) and **passes validation if the taxonomy exists in ENA**. It can be aplied to any string defined in the schema.

This keyword works by doing an asynchronous call to the [ENA API](https://www.ebi.ac.uk/ena/taxonomy/rest/any-name/<REPLACE_ME_WITH_AXONOMY_TERM>) that will respond with the required information to determine if the term exists or not.
Being an async validation step, whenever used in a schema, the schema must have the flag: `"$async": true` in its object root.

#### Usage
Schema:
```js
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Is valid taxonomy expression.",
  "$async": true,
  
  "properties": {
    "value": { 
      "type": "string", 
      "minLength": 1, 
      "isValidTaxonomy": true
    }
  }
}
```
JSON object:
```js
{
  "metagenomic source" : [ {
    "value" : "wastewater metagenome"
  } ]
}
```


## Existing usage of this library
You can see how to use this library in this GitHub repository: 
[JSON Schema Validator service](https://github.com/EMBL-EBI-SUBS/json-schema-validator).
Please follow the [Geting Started](https://github.com/EMBL-EBI-SUBS/json-schema-validator#getting-started) section 
of that repository to set up and execute your own running instance of that validator service into your machine.

If you would like to create your own service/repository using this library, you can check the code in that repository 
and/or you can also check the [Usage](README.md#usage) section in this README.

## License
 For more details about licensing see the [LICENSE](LICENSE.md).
