"use strict";

/* eslint-disable complexity */
var repeat = require("./string-repeat");

function getIndent(indent) {
  return repeat("    ", indent);
}

function attributeSorter(ln) {
  var aRegex = /<[A-Za-z0-9:]+ (.*?)([/ ]*)>/;
  var rest;

  if (aRegex.test(ln)) {
    rest = ln.replace(aRegex, "$1");
  }

  var attrRegex = / *([a-zA-Z0-9:]+)="([^"]+)"/g;
  var match = attrRegex.exec(rest);
  var attributes = [];

  while (match != null) {
    // matched text: match[0]
    // match start: match.index
    // capturing group n: match[n]
    attributes.push({
      key: match[1],
      value: match[2]
    });
    match = attrRegex.exec(rest);
  }

  attributes.sort(function (a1, a2) {
    if (a1.key === a2.key) {
      return 0;
    }

    return a1.key > a2.key ? 1 : -1;
  });
  var stringifiedAttrs = attributes.map(function (attribute) {
    return "".concat(attribute.key, "=\"").concat(attribute.value, "\"");
  }).join(" ");

  if (rest != null) {
    ln = ln.replace(rest, stringifiedAttrs).replace(/ +>/, ">");
  }

  return ln;
}

function xmlprettify(xml) {
  var result = "",
      skip = 0,
      indent = 0;
  var parsed = miniparser(xml);
  parsed.forEach(function (_ref, i) {
    var type = _ref.type,
        value = _ref.value;

    if (skip > 0) {
      skip--;
      return;
    }

    var nextType = i < parsed.length - 1 ? parsed[i + 1].type : "";
    var nnextType = i < parsed.length - 2 ? parsed[i + 2].type : "";

    if (type === "declaration") {
      result += value + "\n";
    }

    if (type === "opening" && nextType === "content" && nnextType === "closing") {
      result += getIndent(indent) + value + parsed[i + 1].value + parsed[i + 2].value + "\n";
      skip = 2;
      return;
    }

    if (type === "opening") {
      result += getIndent(indent) + value + "\n";
      indent++;
    }

    if (type === "closing") {
      indent--;

      if (indent < 0) {
        throw new Error("Malformed xml : ".concat(xml));
      }

      result += getIndent(indent) + value + "\n";
    }

    if (type === "single") {
      result += getIndent(indent) + value + "\n";
    }

    if (type === "content" && !/^[ \n\r\t]+$/.test(value)) {
      result += getIndent(indent) + value.trim() + "\n";
    }
  });

  if (indent !== 0) {
    throw new Error("Malformed xml : ".concat(xml));
  }

  return result;
}

function miniparser(xml) {
  var cursor = 0;
  var state = "outside";
  var currentType = "";
  var content = "";
  var renderedArray = [];

  while (cursor < xml.length) {
    if (state === "outside") {
      var opening = xml.indexOf("<", cursor);

      if (opening !== -1) {
        if (opening !== cursor) {
          content = xml.substr(cursor, opening - cursor);
          content = content.replace(/>/g, "&gt;");
          renderedArray.push({
            type: "content",
            value: content
          });
        }

        state = "inside";
        cursor = opening;
      } else {
        var _content = xml.substr(cursor);

        renderedArray.push({
          type: "content",
          value: _content
        });
        return renderedArray;
      }
    }

    if (state === "inside") {
      var closing = xml.indexOf(">", cursor);

      if (closing !== -1) {
        var tag = xml.substr(cursor, closing - cursor + 1);
        var isSingle = Boolean(tag.match(/^<.+\/>/)); // is this line a single tag? ex. <br />

        var isClosing = Boolean(tag.match(/^<\/.+>/)); // is this a closing tag? ex. </a>

        var isXMLDeclaration = Boolean(tag.match(/^<\?xml/)); // is this a closing tag? ex. </a>

        state = "outside";
        cursor = closing + 1;

        if (isXMLDeclaration) {
          var encodingRegex = /encoding="([^"]+)"/;

          if (encodingRegex.test(tag)) {
            tag = tag.replace(encodingRegex, function (x, p0) {
              return "encoding=\"".concat(p0.toUpperCase(), "\"");
            });
          }

          currentType = "declaration";
        } else if (isSingle) {
          // drop whitespace at the end
          tag = tag.replace(/\s*\/\s*>$/g, "/>");
          tag = attributeSorter(tag);
          currentType = "single";
        } else if (isClosing) {
          // drop whitespace at the end
          tag = tag.replace(/\s+>$/g, ">");
          currentType = "closing";
        } else {
          // drop whitespace at the end
          tag = tag.replace(/\s+>$/g, ">");
          tag = attributeSorter(tag);
          currentType = "opening";
        }

        renderedArray.push({
          type: currentType,
          value: tag
        });
      } else {
        var _content2 = xml.substr(cursor);

        renderedArray.push({
          type: "content",
          value: _content2
        });
        return renderedArray;
      }
    }
  }

  return renderedArray;
}

module.exports = xmlprettify;