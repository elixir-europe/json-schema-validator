"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var printf = winston_1.format.printf, combine = winston_1.format.combine, timestamp = winston_1.format.timestamp;
require("winston-daily-rotate-file");
var winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
var argv = require("yargs").argv;
var logPath = argv.logPath;
// define the custom settings for each transport (console, file)
var options = {
    console: {
        level: "debug",
        json: false,
        colorize: true
    },
    rotate: {
        level: "debug",
        filename: "json-schema-validator-%DATE%.log",
        datePattern: "YYYYMMDD",
        zippedArchive: true,
        dirname: logPath,
        maxSize: "20m",
        maxFiles: "14d" // number of days log files will be kept for
    }
};
var dateFormat = printf(function (info) {
    return info.timestamp + " [" + info.level + "] " + info.message;
});
var transportsArray = [new winston_1.transports.Console(options.console)];
if (logPath) {
    transportsArray.push(new winston_daily_rotate_file_1.default(options.rotate));
}
var logger = winston_1.createLogger({
    format: combine(timestamp(), dateFormat),
    transports: transportsArray,
    exitOnError: false,
});
exports.default = logger;
