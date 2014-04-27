(function () {
    "use strict";

	var fs = require('fs'),
		readline = require('readline'),
		filePathList = [], i, ii, rl, toArray;
	
	toArray = function () { return Array.prototype.slice.call(arguments[0]); };
	rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

	if (process.argv.length < 3) {

		wl("Usage: node app.js [file paths to read]");
		process.exit(0);

	} else {

		for(i = 2, ii = process.argv.length; i<ii;i++) {
			filePathList.push(getActualFilePath(process.argv[i]));
		}

	}

	function getActualFilePath(filePath) {		

		var relative;

		// check absolute path
		if(fs.existsSync(filePath)) {
			return filePath;
		}

		// check relative path
		relative = [__dirname, filePath].join("/");

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

			results.push(params);                

			eachCallback.apply(null, params);

			if(isLastItem) {
				callback(results);
			} else {
				iterate();
			}
		};

		iterate = function () {
			index++;
			var i = index, result,
				params = parameters[i] || [];

			params.push(cb);
			execFunc.apply(this, params);
		};

		iterate();
	};

	/**	 
	 * @param files {stringp[} File path list.
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
		function(err, text) {
			console.log("File read done. Text: " + text);
		},
		function(result) {

			var insertTextArr = [];

			result.forEach(function(i) {
				insertTextArr.push(i[1]);
			});
			
			console.log("All:");

			console.log(insertTextArr.join("\n"));

		});

	rl.question("", function () { rl.close(); });
})();