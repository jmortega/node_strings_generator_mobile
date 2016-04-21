#!/usr/bin/env node

process.on('uncaughtException', function(ex) {
	console.log("Could not parse strings.json:");
	console.log(ex);
	process.exit(1);
});

var fs = require('fs');
var jsonlint = require("./libs/jsonlint.js");

var originSringResourceFile = "strings.json";
var rawJSON = fs.readFileSync(originSringResourceFile, "utf8");

jsonlint.parse(rawJSON);
process.exit(0);
