# lib-unoconv
A node.js wrapper for converting documents with unoconv.  
## Requirements

[Unoconv](http://dag.wieers.com/home-made/unoconv/) is required, which requires [LibreOffice](http://www.libreoffice.org/) (or [OpenOffice](http://www.openoffice.org/).)

## Install

Install with:

    npm install lib-unoconv

## Converting documents

	var unoconv = require('lib-unoconv');

	unoconv.convert('document.docx', 'pdf', function (err, result) {
		// result is returned as a Buffer
		fs.writeFile('converted.pdf', result);
	});

## Starting a listener

You can also start a unoconv listener to avoid launching Libre/OpenOffice on every conversion:

	unoconv.listen();

## API

### unoconv.convert(file, outputFormat, [options], callback)

Converts `file` to the specified `outputFormat`. `options` is an object with the following properties:

* `bin` Path to the unoconv binary
* `port` Unoconv listener port to connect to
* `out` output basename, filename or directory

`callback` gets the arguments `err` and `result`. `result` is returned as a Buffer object.


### unoconv.listen([options])

Starts a new unoconv listener. `options` accepts the same parameters as `convert()`.

Returns a `ChildProcess` object. You can handle errors by listening to the `stderr` property:

	var listener = unoconv.listen({ port: 2002 });

	listener.stderr.on('data', function (data) {
		console.log('stderr: ' + data.toString('utf8'));
	});

### unoconv.detectSupportedFormats([options], callback)

This function parses the output of `unoconv --show` to attempt to detect supported output formats.

`options` is an object with the following properties:

* `bin` Path to the unoconv binary

`callback` gets the arguments `err` and `result`. `result` is an object containing a collection of supported document types and output formats.

## License  
MIT License

Copyright (c) 2018 Yue Lv

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
