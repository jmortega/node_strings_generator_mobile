# Node Strings generator

Node Strings generator is a command line tool to generate the strings files for iOS, Android, HTML5 platforms from a easy to manage JSON file.

## Install on OS X

If you're using the excellent homebrew package manager, you can install node with one command:

	brew update
	brew install node

Otherwise, follow the below steps:

Install Xcode.
Install git.
Run the following commands:

	git clone git://github.com/ry/node.git
	cd node
	./configure
	make
	sudo make install

## Install on Windows
Download and Install Node:
https://nodejs.org/en/download/

## Usage

node generate strings.json outputPlatform

Where `strings.json` is the file with the original strings in JSON

outputPlatform can be 'ios', 'android', 'html5'



## JSON Strings file

The JSON containing the translations must have a estructure like this one:

	{
		"availableLangs": ["es-ES", "en-EN"],

		"sectionTitle": {
			"subSectionTitle": {
				"Text": {
					"es-ES": "FinalText",
					"en-EN": "FinalText"
				}
			}
		}
	}


**availableLangs** node is required and it must contain an array of available languages of the document. 

The langs of this array must be used to name the final leafs of the JSON structure in order to identify the language of every text.

There is no limitations of levels inside the JSON file, and the name of the output Strings will match: sectionTitle.subSectionTitle.Text

## Conventions

### Missing translations
Whenever we find some text that we have no translation for it, we will add it to strings.json in language we know and we will put the key between # (#SOME_TEXT#) for other languages.

### Structure - Levels

The file `strings.json` is structured in different levels(categories).

Strings should be reused as little as possible. Repeated strings in different categories are welcome. 

* **generic**: general texts that appear in same context
* **errors**: different app error messages in different contexts
* **operations**: texts of each operation screen
* **menu**
* **settings**

## Practical example

iOS adds string “login” to repo translations:

1. Opens `strings.json`
2. Adds “login” (where it corresponds!)
3. Generates resources with `script.js`
4. Copy generated resources in the iOS project

Android adds strings.xml in values folder for translations:

1. Generates resources with `script.js`
2. Copies new resources in the Android project