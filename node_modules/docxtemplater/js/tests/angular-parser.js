"use strict";

var expressions = require("angular-expressions");

var assign = require("lodash/assign");

function angularParser(tag) {
  if (tag === ".") {
    return {
      get: function get(s) {
        return s;
      }
    };
  }

  var expr = expressions.compile(tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"')); // isAngularAssignment will be true if your tag contains a `=`, for example
  // when you write the following in your template :
  // {full_name = first_name + last_name}
  // In that case, it makes sense to return an empty string so
  // that the tag does not write something to the generated document.

  var isAngularAssignment = expr.ast.body[0] && expr.ast.body[0].expression.type === "AssignmentExpression";
  return {
    get: function get(scope, context) {
      var obj = {};
      var scopeList = context.scopeList;
      var num = context.num;

      for (var i = 0, len = num + 1; i < len; i++) {
        obj = assign(obj, scopeList[i]);
      }

      var result = expr(scope, obj);

      if (isAngularAssignment) {
        return "";
      }

      return result;
    }
  };
}

module.exports = angularParser;