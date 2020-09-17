"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function isArray(thing) {
  return thing instanceof Array;
}

function isObject(thing) {
  return thing instanceof Object && !isArray(thing);
}

function isString(thing) {
  return typeof thing === "string";
}

var AssertionModule = /*#__PURE__*/function () {
  function AssertionModule() {
    _classCallCheck(this, AssertionModule);
  }

  _createClass(AssertionModule, [{
    key: "preparse",
    value: function preparse(parsed) {
      if (!isArray(parsed)) {
        throw new Error("Parsed should be an array");
      }
    }
  }, {
    key: "parse",
    value: function parse(placeholderContent) {
      if (!isString(placeholderContent)) {
        throw new Error("placeholderContent should be a string");
      }
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, _ref) {
      var filePath = _ref.filePath,
          contentType = _ref.contentType;

      if (!isArray(parsed)) {
        throw new Error("Parsed should be an array");
      }

      if (!isString(filePath)) {
        throw new Error("filePath should be a string");
      }

      if (!isString(contentType)) {
        throw new Error("contentType should be a string");
      }
    }
  }, {
    key: "render",
    value: function render(part, _ref2) {
      var filePath = _ref2.filePath,
          contentType = _ref2.contentType;

      if (!isObject(part)) {
        throw new Error("part should be an object");
      }

      if (!isString(filePath)) {
        throw new Error("filePath should be a string");
      }

      if (!isString(contentType)) {
        throw new Error("contentType should be a string");
      }
    }
  }, {
    key: "postrender",
    value: function postrender(parts) {
      if (!isArray(parts)) {
        throw new Error("Parts should be an array");
      }

      return parts;
    }
  }]);

  return AssertionModule;
}();

module.exports = AssertionModule;