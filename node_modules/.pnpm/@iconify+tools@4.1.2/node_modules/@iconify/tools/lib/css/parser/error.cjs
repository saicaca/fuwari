'use strict';

function styleParseError(message, code, index) {
  let fullMessage = message;
  if (typeof index === "number" && index !== -1) {
    const start = index;
    const remaining = code.slice(index) + "!";
    const trimmed = remaining.trim();
    const end = start + remaining.length - trimmed.length;
    const code2 = code.slice(0, end);
    const line = code2.length - code2.replace(/\n/g, "").length + 1;
    fullMessage = message + " on line " + line.toString();
  }
  return {
    type: "style-parse-error",
    message,
    code,
    index,
    fullMessage
  };
}

exports.styleParseError = styleParseError;
