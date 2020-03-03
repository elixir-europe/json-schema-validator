const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./winston");
const AppError = require("./model/application-error");
const { check, validationResult } = require("express-validator/check");
const path = require('path')

let ElixirValidator  = require('./elixir-validator');
let GraphRestriction = require('./keywords/graph_restriction');
let IsChildTermOf = require('./keywords/ischildtermof');
let IsValidTerm = require('./keywords/isvalidterm');

const argv = require("yargs").argv;
const npid = require("npid");

const app = express();
const port = process.env.PORT || 3020;
const elixirValidator = new ElixirValidator([
  new GraphRestriction(null, "https://www.ebi.ac.uk/ols/api"),
  new IsChildTermOf(null, "https://www.ebi.ac.uk/ols/api/search?q="),
  new IsValidTerm(null, "https://www.ebi.ac.uk/ols/api/search?q=")
]);

app.use(express.static('src/views'));

// app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    let appError = new AppError("Received malformed JSON.");
    logger.log("info", appError.errors);
    res.status(400).send(appError);
  } else {
    let appError = new AppError(err.message);
    logger.log("error", appError.errors);
    res.status(err.status).send(appError);
  }
});

// -- Endpoint definition -- //
app.post("/validate", [
  check("schema", "Required.").exists(),
  check("object", "Required.").exists()
],(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  } else {
    logger.log("debug", "Received POST request.");
    elixirValidator.validate(req.body.schema, req.body.object).then((output) => {
      logger.log("silly", "Sent validation results.");
      res.status(200).send(output);
    }).catch((err) => {
      logger.log("error", err.message);
      res.status(500).send(new AppError(err.message));
    });
  }
});


app.get("/validate", (req, res) => {
  logger.log("silly", "Received GET request.");
  res.send({
    message: "This is the Submissions JSON Schema Validator. Please POST to this endpoint the schema and object to validate structured as showed in bodyStructure.",
    bodyStructure: {
      schema: {},
      object: {}
    },
    repository: "https://github.com/elixir-europe/json-schema-validator"
  });
});


app.listen(port, () => {
  logger.log("info", ` -- Started server on port ${port} --`);
  if(argv.logPath) { logger.log("info", ` --> Log output: ${argv.logPath}`); }
});

// -- For monitoring purposes -- //
const pidPath = argv.pidPath || "./server.pid";
try {
  let pid = npid.create(pidPath);
  pid.removeOnExit();
} catch(err) {
  logger.log("error", err);
  process.exit(1);
}

// Handles crt + c event
process.on("SIGINT", () => {
  npid.remove(pidPath);
  process.exit();
});

// Handles kill -USR1 pid event (monit)
process.on("SIGUSR1", () => {
  npid.remove(pidPath);
  process.exit();
});

//Handles kill -USR2 pid event (nodemon)
process.on("SIGUSR2", () => {
  npid.remove(pidPath);
  process.exit();
});