(function () {
    "use strict";

	var fs = require('fs'),
		readline = require('readline'),
		filePathList = [], i, ii,

		toArray = function () { return Array.prototype.slice.call(arguments[0]); },

		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

	// validate call, must contain at least 3 arguments
	if (process.argv.length < 3) {
		wl("Usage: node multiread.js [file paths to read]");
		process.exit(0);
	}

	// start from 3rd parameter, add them to filePathList
	for(i = 2, ii = process.argv.length; i < ii; i++) {
		filePathList.push(getActualFilePath(process.argv[i]));
	}

	// check file path
	function getActualFilePath(filePath) {
		var relative;

		// check absolute path
		if(fs.existsSync(filePath)) {
			return filePath;
		}

		// get absolute path from relative path
		relative = [__dirname, filePath].join("/");

		// check relative path
		if(fs.existsSync(relative)) {
			return relative;
		}

		throw new Error("File " + filePath + " not found");
	}

	/**
	 * @param execFunc {Function} Function that will be called for each parameter set in @parameters array.
	 * @param parameters {Object[]} Array where each item is array objects which will be used in each call.
	 * @param eachCallback {Function} Callback after each execution.
	 * @param callback {Function} Callback when all parameters are processed.
	 */
	function batch(execFunc, parameters, eachCallback, callback) {
		var index = -1, cb, iterate, results= [];

		cb = function () {
			var params = toArray(arguments),
				isLastItem = index == parameters.length - 1;

			// put results from callback to results list for later processing
			// results list is passed into final callback function
			results.push(params);

			// notify that current call is done
			eachCallback.apply(null, params);

			if(isLastItem) {
				// if it is last item in parameter list, call final callback
				callback(results);
			} else {
				// continue iteration through parameters
				iterate();
			}
		};

		iterate = function () {
			index++;
			var i = index,
				params = parameters[i] || [];

			// 'params' collection was created in 'batchRead' method and it contains all parameters needed to invoke a function
			// here we are adding last parameter in collection which is callback function 'cb' which is scoped inside parent function
			// inside 'cb' function iterate function will be called again until all parameters are not processed.
			params.push(cb);
			execFunc.apply(this, params);
		};

		// first iteration call
		iterate();
	};

	/**
	 * @param files {string[]} File path list.
	 * @param eachCallback {Function} Callback after each execution.
	 * @param callback {Function} Callback when all parameters are processed.
	 */
	function batchRead(files, eachCallback, callback) {
		var encoding = 'utf8',
			params = [];

		// build parameter array
		files.forEach(function(file) {
			params.push([file, encoding]);
		});

		batch(fs.readFile, params, eachCallback, callback);
	}

	batchRead(filePathList,
		// callback after each file read
		function(err, text) {
			console.log("File read done. Text: " + text);
		},

		// callback when everything is done
		function(result) {
			var insertTextArr = [];

			result.forEach(function(i) {
				insertTextArr.push(i[1]);
			});

			console.log("");
			console.log("All:");

			console.log(insertTextArr.join("\n"));
		});

	// wait in console
	rl.question("", function () { rl.close(); });
})();