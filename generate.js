process.on('uncaughtException', function(ex) {
	console.log("");
	console.log("------------------ERROR------------------");
	console.log("");
	console.log(ex);
	console.log("");
	console.log("-----------------------------------------");
	console.log("");
	process.exit(1);
});

var fs = require('fs'),
	lib = require('./libs/lib.js'),
	jsonlint = require("./libs/jsonlint.js").parser; //Documentation and examples: https://github.com/zaach/jsonlint
	HTML5RootLanguage = "es-ES";


	var originSringResourceFile = process.argv[2]; //get the path to the originString.json
	if (!fs.existsSync(originSringResourceFile)) throw "The origin JSON string file does not exist (filename: " + originSringResourceFile + ") usage: node generate strings.json [ios|android]";


	var outputFormat = process.argv[3]; //get the output format. Must be 'ios' or 'android'
	if (outputFormat!=='ios' && outputFormat!=='android' && outputFormat!=='html5' && outputFormat!=='csv' && outputFormat!=='po') throw "Format error. Admited formats are: ios, android, html5, csv. usage: node generate strings.json [ios|android|html5|csv|po]";

	var outputMode = process.argv[4]; //get the output mode. 'all' or 'nottranslated'
	if (outputMode!=='all' && outputMode!=='nottranslated') outputMode = 'all';
	if (outputFormat!='po' && outputFormat!='csv') outputMode = 'all';


	var rawJSON = fs.readFileSync(originSringResourceFile, "utf8");
	var stringResources;

	//validate JSON, remplacing the parser from JSON to jsonlint
	stringResources = jsonlint.parse(rawJSON); //parse the origin js language
	// stringResources = JSON.parse(rawJSON); //parse the origin js language

	//prepare folders
	lib.deleteFolderRecursive(outputFormat);
	fs.mkdirSync(outputFormat);

if (outputFormat === 'csv') {
	var	fileNameUTF = outputFormat + '/utf8.csv',
		fileNameISO = outputFormat + '/ascii.csv';

	var fileOutUTF = fs.createWriteStream(fileNameUTF, { encoding: "utf8" }),
		fileOutISO = fs.createWriteStream(fileNameISO, { encoding: "ascii" });

	fileOutUTF.write('Title;');
	fileOutISO.write('Title;');
	for (var lang in stringResources.availableLangs) {
		fileOutUTF.write(stringResources.availableLangs[lang] + ';');
		fileOutISO.write(stringResources.availableLangs[lang] + ';');
	}
	fileOutUTF.write('\n');
	fileOutISO.write('\n');

	lib.convertJSONStringsToCSVFile(outputFormat, stringResources.availableLangs, fileOutUTF, fileOutISO, stringResources);
	fileOutUTF.end();
	fileOutISO.end();
} else {
	//get available languages from origin JSON file.
	//The first node of the JSON must be:
	//{
	//    "availableLangs": ["es-ES", "ca-ES"],
	// ....
	// }
	var availableLangs = stringResources.availableLangs;

	//Create a file for every language
	for (var i=0; i<availableLangs.length; i++){

		var	lng = availableLangs[i],
			folderName = null,
			fileName = null;

		//create the foder structure and file names depending on platform
		var shortLanguage = lng.split('-')[0],
			isHTML5RootLanguage = lng == HTML5RootLanguage;

		switch(outputFormat){
			case 'ios':
				folderName = outputFormat + '/' + shortLanguage + '.lproj';
				fileName = folderName + '/Localizable.strings';
				break;
			case 'android':
				folderName = outputFormat + '/values-' + shortLanguage;
				fileName = folderName + '/strings.xml';
				break;
			case 'html5':
				folderName = isHTML5RootLanguage? outputFormat : outputFormat + '/' + lng;//root HTML5 language
				fileName = folderName + '/messageBundle.js';
				break;
			case 'po':
				folderName = outputFormat;
				fileName = folderName + '/strings-' + lng + '.po';
				break;
		}
		if(!fs.existsSync(folderName)) //prevent creating HTML5 root language folder
		fs.mkdirSync(folderName);

		var fileOut = fs.createWriteStream(fileName, { encoding: "utf8" });

		//Write file
		lib.fileHeader(outputFormat, lng, fileOut, isHTML5RootLanguage);
		lib.convertJSONStringsToFile(outputFormat, lng, fileOut, outputMode, stringResources);
		lib.fileFooter(outputFormat, lng, fileOut, availableLangs, isHTML5RootLanguage);

		//finish
		fileOut.end();
	}
}

console.log("");
console.log("------------------RESULT------------------");
console.log("");
console.log("Language files created correctly");
console.log("");
console.log("------------------------------------------");
console.log("");
