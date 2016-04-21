var fs = require('fs'),
	path = require('path')
	_this = this;

/*
 * Convert from JSON string structure to the outputformat structure. The results are writed directly to a Stream
 * The function is recursive and calls itself for every new node found. The function accumulate the 'name' of the node to give
 * to every leaf of the node the name of the full path to the leaf.
 *
 * @param <String> outputFormat: The desired output format. Must be 'ios' or 'android'
 * @param <String> langToProcess: The language we want to process. Should be something like 'es-ES'
 * @param <outputStream> writeStream: The stream to write te result to.
 * @param <JSON obj> jsonObj: The JSON Objecto to convert
 * @param <String> nodeName: The node name of the jsonOBJ received. It's created automatically.
 */
exports.convertJSONStringsToFile = function(outputFormat, langToProcess, writeStream, outputMode, jsonObj, nodeName, defaultLNG) {

	if (!nodeName) nodeName = '';	//ini nodeName if undefined

	if( typeof jsonObj == "object" ) {	//if jsopObj is Object, nedd to make a recursive call again
		var defaultLNG = null;
		for (var name in jsonObj) {
			if (name=="es-ES") defaultLNG = jsonObj[name];
		}

		for (var name in jsonObj) {
			if (name != "availableLangs") {	//discard the availableLangs node
				if (typeof jsonObj[name] == "object"){
					if (nodeName === '') _this.convertJSONStringsToFile(outputFormat, langToProcess, writeStream, outputMode, jsonObj[name], name);
					else {
						switch(outputFormat){
							case 'ios':
							case 'po':
								_this.convertJSONStringsToFile(outputFormat, langToProcess, writeStream, outputMode, jsonObj[name], nodeName + '.' + name);
								break;
							default:
								_this.convertJSONStringsToFile(outputFormat, langToProcess, writeStream, outputMode, jsonObj[name], nodeName + '_' + name);
								break;
						}
					}
				}else{
					if (name==langToProcess) _this.convertJSONStringsToFile(outputFormat, langToProcess, writeStream, outputMode, jsonObj[name], nodeName, defaultLNG);
				}
			}
		}
	}
	else {
		//preserve EOL and other java escaped char
		if( typeof jsonObj == "string" ) {
			jsonObj = jsonObj.replace(/(\r\n|\n|\r)/gm,"\\n");
			
			if (outputFormat !== 'po') {
				jsonObj = jsonObj.replace(/'/gm,"\\'");
			}
			
			if (outputFormat !== 'android') {
				jsonObj = jsonObj.replace(/\"/gm, '\\"');
			}
		}

		if ((outputMode=='all') || (outputMode=='nottranslated' && jsonObj.indexOf("##")==0)) {
			// jsonOb is a number or string (not an object)
			switch(outputFormat){
				case 'ios':
					writeStream.write('"' + nodeName + '" = "' + _this.prepareString(jsonObj) + '";\n');
					break;
				case 'android':
					writeStream.write('  <string formatted="false" name="' + nodeName + '">' + _this.prepareString(jsonObj) + '</string>\n');
					break;
				case 'html5':
					writeStream.write('\t"' + nodeName + '": "' + _this.prepareString(jsonObj) + '",\n');
					break;
				case 'po':
					writeStream.write('#: "' + nodeName + '"\r\nmsgid "' + _this.prepareString(defaultLNG) + '"\r\nmsgctxt "' + nodeName + '"\r\nmsgstr "' + _this.prepareString(jsonObj) + '"\r\n\r\n');
					break;
			}
		}
	}

};

exports.convertJSONStringsToCSVFile = function(outputFormat, arrayLangs, writeStreamUTF, writeStreamISO, jsonObj, nodeName) {

	if (!nodeName) nodeName = '';	//ini nodeName if undefined

	var typeOf;
	for (var property in jsonObj) {
	    if (jsonObj.hasOwnProperty(property)) {
	        typeOf = jsonObj[property];
	        break;
	    }
	}

	if( typeof jsonObj == "object" && typeof typeOf == "object") {	//if jsopObj is Object, nedd to make a recursive call again
		for (var name in jsonObj) {
			if (name != "availableLangs") {	//discard the availableLangs node
				if (typeof jsonObj[name] == "object"){
					if (nodeName === '') _this.convertJSONStringsToCSVFile(outputFormat, arrayLangs, writeStreamUTF, writeStreamISO, jsonObj[name], name);
					else _this.convertJSONStringsToCSVFile(outputFormat, arrayLangs, writeStreamUTF, writeStreamISO, jsonObj[name], nodeName + '_' + name);
				} else _this.convertJSONStringsToCSVFile(outputFormat, arrayLangs, writeStreamUTF, writeStreamISO, jsonObj[name], nodeName);
			}
		}
	} else {
		writeStreamUTF.write(nodeName + ';');
		writeStreamISO.write(nodeName + ';');
		for (var lang in arrayLangs) {
			if (jsonObj[arrayLangs[lang]]) {
				writeStreamUTF.write(jsonObj[arrayLangs[lang]].replace(/(\r\n|\n|\r)/gm,"\\n") + ';');
				writeStreamISO.write(jsonObj[arrayLangs[lang]].replace(/(\r\n|\n|\r)/gm,"\\n") + ';');
			}
		}
		writeStreamUTF.write('\n');
		writeStreamISO.write('\n');
	}

};

/*
 * Write the header of the output language file
 *
 * @param <String> outputFormat: The desired output format. Must be 'ios' or 'android'
 * @param <outputStream> writeStream: The stream to write te result to.
 */
exports.fileHeader = function(outputFormat, language, writeStream, isHTML5RootLanguage) {
	if (outputFormat === "android") {
		writeStream.write('<?xml version="1.0" encoding="utf-8"?>\n');
		writeStream.write('<resources>\n');
	}

	if(outputFormat == "html5"){
		writeStream.write('define({\n');
		if(isHTML5RootLanguage){
			writeStream.write('"root": {\n');
		}
	}

	if (outputFormat === "po") {
		writeStream.write('msgid ""\n');
		writeStream.write('msgstr ""\n');
		writeStream.write('"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n');
		writeStream.write('"Project-Id-Version: Ideaknow\\n"\n');
		writeStream.write('"POT-Creation-Date: \\n"\n');
		writeStream.write('"PO-Revision-Date: \\n"\n');
		writeStream.write('"Last-Translator: \\n"\n');
		writeStream.write('"Language-Team: \\n"\n');
		writeStream.write('"MIME-Version: 1.0\\n"\n');
		writeStream.write('"Content-Type: text/plain; charset=UTF-8\\n"\n');
		writeStream.write('"Content-Transfer-Encoding: 8bit\\n"\n');
		writeStream.write('"Language: ' + language + '\\n"\n');
		writeStream.write('"X-Generator: Poedit 1.6.10\\n"\n');
		writeStream.write('\n');
	}
};

/*
 * Write the footer of the output language file
 *
 * @param <String> outputFormat: The desired output format. Must be 'ios' or 'android'
 * @param <outputStream> writeStream: The stream to write te result to.
 */
exports.fileFooter = function(outputFormat, language, writeStream, availableLangs, isHTML5RootLanguage) {
	if (outputFormat === "android") {
		writeStream.write('</resources>');
	}

	if(outputFormat == "html5"){
		writeStream.write('\t"ThisIsTheEnd": "my only friend, the EOF."');
		if(isHTML5RootLanguage){
			writeStream.write('\n}');
			for (var i=0; i<availableLangs.length; i++){
				var	lng = availableLangs[i];
				if(lng != language)
					writeStream.write(',\n"'+lng+'": true');
			}
		}
		writeStream.write('\n});');
	}
};

/*
 * Delete a entire folder and its contents
 *
 * @param <String> path: the path of the folder to delete
 */
 exports.deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                _this.deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/*
 * return a valide string from original JSON file, removeing the ##
 *
 * @param <String> str: The original string
 */
exports.prepareString = function(str) {
	if (!str) return "";
	else return str.replace(/##/g,"");
};
