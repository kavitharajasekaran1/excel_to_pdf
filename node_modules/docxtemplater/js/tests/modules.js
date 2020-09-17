"use strict";

var _require = require("./utils"),
    expectToThrow = _require.expectToThrow,
    createDoc = _require.createDoc,
    shouldBeSame = _require.shouldBeSame,
    isNode12 = _require.isNode12,
    createDocV4 = _require.createDocV4;

var Errors = require("../errors.js");

var _require2 = require("chai"),
    expect = _require2.expect;

var _require3 = require("../doc-utils"),
    xml2str = _require3.xml2str,
    traits = _require3.traits;

describe("Verify apiversion", function () {
  it("should work with valid api version", function () {
    var module = {
      requiredAPIVersion: "3.23.0",
      render: function render(part) {
        return part.value;
      }
    };
    var doc = createDoc("loop-valid.docx");
    doc.attachModule(module);
  });
  it("should fail with invalid api version", function () {
    var module = {
      requiredAPIVersion: "3.92.0",
      render: function render(part) {
        return part.value;
      }
    };
    var doc = createDoc("loop-valid.docx");
    expectToThrow(function () {
      return doc.attachModule(module);
    }, Errors.XTAPIVersionError, {
      message: "The minor api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater",
      name: "APIVersionError",
      properties: {
        id: "api_version_error",
        currentModuleApiVersion: [3, 24, 0],
        neededVersion: [3, 92, 0]
      }
    });
  });
});
describe("Module attachment", function () {
  it("should not allow to attach the same module twice", function () {
    var module = {
      name: "TestModule",
      requiredAPIVersion: "3.0.0",
      render: function render(part) {
        return part.value;
      }
    };
    var doc1 = createDoc("loop-valid.docx");
    doc1.attachModule(module);
    var doc2 = createDoc("tag-example.docx");
    var errMessage = null;

    try {
      doc2.attachModule(module);
    } catch (e) {
      errMessage = e.message;
    }

    expect(errMessage).to.equal('Cannot attach a module that was already attached : "TestModule". Maybe you are instantiating the module at the root level, and using it for multiple instances of Docxtemplater');
  });
});
describe("Module xml parse", function () {
  it("should not mutate options (regression for issue #526)", function () {
    var module = {
      requiredAPIVersion: "3.0.0",
      optionsTransformer: function optionsTransformer(options, docxtemplater) {
        var relsFiles = docxtemplater.zip.file(/document.xml.rels/).map(function (file) {
          return file.name;
        });
        options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
        return options;
      }
    };
    var doc = createDoc("tag-example.docx");
    var opts = {};
    doc.setOptions(opts);
    doc.attachModule(module);
    doc.compile();
    expect(opts).to.deep.equal({});
  });
  it("should be possible to parse xml files", function () {
    var xmlDocuments;
    var module = {
      requiredAPIVersion: "3.0.0",
      optionsTransformer: function optionsTransformer(options, docxtemplater) {
        var relsFiles = docxtemplater.zip.file(/document.xml.rels/).map(function (file) {
          return file.name;
        });
        options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
        return options;
      },
      set: function set(options) {
        if (options.xmlDocuments) {
          xmlDocuments = options.xmlDocuments;
        }
      }
    };
    var doc = createDoc("tag-example.docx");
    doc.attachModule(module);
    doc.compile();
    var xmlKeys = Object.keys(xmlDocuments);
    expect(xmlKeys).to.deep.equal(["word/_rels/document.xml.rels"]);
    var rels = xmlDocuments["word/_rels/document.xml.rels"].getElementsByTagName("Relationship");
    expect(rels.length).to.equal(10);
    var str = xml2str(xmlDocuments["word/_rels/document.xml.rels"]);

    if (isNode12()) {
      expect(str).to.equal("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId8\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer\" Target=\"footer1.xml\"/><Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings\" Target=\"settings.xml\"/><Relationship Id=\"rId7\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/header\" Target=\"header1.xml\"/><Relationship Id=\"rId2\" Type=\"http://schemas.microsoft.com/office/2007/relationships/stylesWithEffects\" Target=\"stylesWithEffects.xml\"/><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/><Relationship Id=\"rId6\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes\" Target=\"endnotes.xml\"/><Relationship Id=\"rId5\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes\" Target=\"footnotes.xml\"/><Relationship Id=\"rId10\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme\" Target=\"theme/theme1.xml\"/><Relationship Id=\"rId4\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings\" Target=\"webSettings.xml\"/><Relationship Id=\"rId9\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable\" Target=\"fontTable.xml\"/></Relationships>");
      rels[5].setAttribute("Foobar", "Baz");
      doc.render();
      shouldBeSame({
        doc: doc,
        expectedName: "expected-module-change-rels.docx"
      });
    }
  });
});
describe("Module unique tags xml", function () {
  it("should not cause an issue if tagsXmlLexedArray contains duplicates", function () {
    var module = {
      requiredAPIVersion: "3.0.0",
      optionsTransformer: function optionsTransformer(options, docxtemplater) {
        docxtemplater.fileTypeConfig.tagsXmlLexedArray.push("w:p", "w:r", "w:p");
        return options;
      }
    };
    var doc = createDoc("tag-example.docx");
    doc.attachModule(module);
    doc.setData({
      first_name: "Hipp",
      last_name: "Edgar",
      phone: "0652455478",
      description: "New Website"
    });
    doc.compile();
    doc.render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-tag-example.docx"
    });
  });
});
describe("Module traits", function () {
  it("should not cause an issue if using traits.expandTo containing loop", function () {
    var moduleName = "comment-module";

    function getInner(_ref) {
      var part = _ref.part,
          leftParts = _ref.leftParts,
          rightParts = _ref.rightParts,
          postparse = _ref.postparse;
      part.subparsed = postparse([].concat(leftParts).concat(rightParts), {
        basePart: part
      });
      return part;
    }

    var module = {
      name: "Test module",
      requiredAPIVersion: "3.0.0",
      parse: function parse(placeHolderContent) {
        if (placeHolderContent[0] === "£") {
          var type = "placeholder";
          return {
            type: type,
            value: placeHolderContent.substr(1),
            module: moduleName
          };
        }
      },
      postparse: function postparse(parsed, _ref2) {
        var postparse = _ref2.postparse;
        parsed = traits.expandToOne(parsed, {
          moduleName: moduleName,
          getInner: getInner,
          expandTo: ["w:p"],
          postparse: postparse
        });
        return parsed;
      },
      render: function render(part) {
        if (part.module === moduleName) {
          return {
            value: ""
          };
        }
      }
    };
    var doc = createDoc("comment-with-loop.docx");
    doc.attachModule(module);
    doc.setData({}).compile().render();
    shouldBeSame({
      doc: doc,
      expectedName: "expected-comment-example.docx"
    });
  });
});
describe("Module errors", function () {
  it("should work", function () {
    var moduleName = "ErrorModule";
    var module = {
      name: "Error module",
      requiredAPIVersion: "3.0.0",
      parse: function parse(placeHolderContent) {
        var type = "placeholder";
        return {
          type: type,
          value: placeHolderContent,
          module: moduleName
        };
      },
      render: function render(part) {
        if (part.module === moduleName) {
          return {
            errors: [new Error("foobar ".concat(part.value))]
          };
        }
      }
    };
    var error = null;
    var doc = createDoc("tag-example.docx");
    doc.attachModule(module);
    doc.setData({}).compile();

    try {
      doc.render();
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an("object");
    expect(error.message).to.equal("Multi error");
    expect(error.properties.errors.length).to.equal(9);
    expect(error.properties.errors[0].message).to.equal("foobar last_name");
    expect(error.properties.errors[1].message).to.equal("foobar first_name");
    expect(error.properties.errors[2].message).to.equal("foobar phone");
  });
});
describe("Module should pass options to module.parse, module.postparse, module.render, module.postrender", function () {
  it("should pass filePath and contentType options", function () {
    var doc = createDoc("tag-example.docx");
    var filePaths = [];
    var renderFP = "",
        renderCT = "",
        postrenderFP = "",
        postrenderCT = "",
        postparseFP = "",
        postparseCT = "";
    var ct = [];
    var module = {
      name: "Test module",
      requiredAPIVersion: "3.0.0",
      parse: function parse(a, options) {
        filePaths.push(options.filePath);
        ct.push(options.contentType);
      },
      postparse: function postparse(a, options) {
        postparseFP = options.filePath;
        postparseCT = options.contentType;
        return a;
      },
      render: function render(a, options) {
        renderFP = options.filePath;
        renderCT = options.contentType;
      },
      postrender: function postrender(a, options) {
        postrenderFP = options.filePath;
        postrenderCT = options.contentType;
        return a;
      }
    };
    doc.attachModule(module);
    doc.setData({}).compile();
    doc.render();
    expect(renderFP).to.equal("word/document.xml");
    expect(renderCT).to.equal("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");
    expect(postparseFP).to.equal("word/document.xml");
    expect(postparseCT).to.equal("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");
    expect(postrenderFP).to.equal("word/document.xml");
    expect(postrenderCT).to.equal("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");
    expect(filePaths).to.deep.equal([// Header appears 4 times because there are 4 tags in the header
    "word/header1.xml", "word/header1.xml", "word/header1.xml", "word/header1.xml", // Footer appears 3 times because there are 3 tags in the header
    "word/footer1.xml", "word/footer1.xml", "word/footer1.xml", // Document appears 2 times because there are 2 tags in the header
    "word/document.xml", "word/document.xml"]);
    expect(ct).to.deep.equal(["application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"]);
  });
});
describe("Module detachment", function () {
  it("should detach the module when the module does not support the document filetype", function () {
    var isModuleCalled = false;
    var isDetachedCalled = false;
    var module = {
      optionsTransformer: function optionsTransformer(options) {
        isModuleCalled = true;
        return options;
      },
      on: function on(eventName) {
        if (eventName === "detached") {
          isDetachedCalled = true;
        }
      },
      supportedFileTypes: ["pptx"]
    };
    createDocV4("tag-example.docx", {
      modules: [module]
    });
    expect(isDetachedCalled).to.equal(true);
    expect(isModuleCalled).to.equal(false);
  });
});