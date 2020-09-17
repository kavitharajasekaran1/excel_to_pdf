"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var wrapper = require("../module-wrapper");

var _require = require("../doc-utils"),
    concatArrays = _require.concatArrays;

var docxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
var docxmContentType = "application/vnd.ms-word.document.macroEnabled.main+xml";
var pptxContentType = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
var dotxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml";
var dotmContentType = "application/vnd.ms-word.template.macroEnabledTemplate.main+xml";
var filetypes = {
  docx: [docxContentType, docxmContentType, dotxContentType, dotmContentType],
  pptx: [pptxContentType]
};

var Common = /*#__PURE__*/function () {
  function Common() {
    _classCallCheck(this, Common);

    this.name = "Common";
  }

  _createClass(Common, [{
    key: "set",
    value: function set(_ref) {
      var invertedContentTypes = _ref.invertedContentTypes;

      if (invertedContentTypes) {
        this.invertedContentTypes = invertedContentTypes;
      }
    }
  }, {
    key: "getFileType",
    value: function getFileType(_ref2) {
      var doc = _ref2.doc;
      var invertedContentTypes = this.invertedContentTypes;

      if (!this.invertedContentTypes) {
        return;
      }

      var keys = Object.keys(filetypes);

      for (var i = 0, len = keys.length; i < len; i++) {
        var ftCandidate = keys[i];
        var contentTypes = filetypes[ftCandidate];

        for (var j = 0, len2 = contentTypes.length; j < len2; j++) {
          var ct = contentTypes[j];

          if (invertedContentTypes[ct]) {
            doc.targets = concatArrays([doc.targets, invertedContentTypes[ct]]);
            return ftCandidate;
          }
        }
      }
    }
  }]);

  return Common;
}();

module.exports = function () {
  return wrapper(new Common());
};