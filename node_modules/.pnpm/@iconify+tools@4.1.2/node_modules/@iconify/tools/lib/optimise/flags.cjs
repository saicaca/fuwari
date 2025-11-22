'use strict';

const svg_parse = require('../svg/parse.cjs');

const CLOSE_PATH = 1;
const MOVE_TO = 2;
const HORIZ_LINE_TO = 4;
const VERT_LINE_TO = 8;
const LINE_TO = 16;
const CURVE_TO = 32;
const SMOOTH_CURVE_TO = 64;
const QUAD_TO = 128;
const SMOOTH_QUAD_TO = 256;
const ARC = 512;
const argCount = {
  [MOVE_TO]: 2,
  [LINE_TO]: 2,
  [HORIZ_LINE_TO]: 1,
  [VERT_LINE_TO]: 1,
  [CLOSE_PATH]: 0,
  [QUAD_TO]: 4,
  [SMOOTH_QUAD_TO]: 2,
  [CURVE_TO]: 6,
  [SMOOTH_CURVE_TO]: 4,
  [ARC]: 7
};
const isDigit = (num) => num >= 48 && num <= 57;
const isWhiteSpace = (num) => num === 32 || num === 9 || num === 13 || num === 10;
function cleanPath(path) {
  const commands = [];
  const length = path.length;
  let currentNumber = "";
  let currentNumberHasExp = false;
  let currentNumberHasExpDigits = false;
  let currentNumberHasDecimal = false;
  let canParseCommandOrComma = true;
  let currentCommand = null;
  let currentCommandType = null;
  let currentArgs = [];
  let i = 0;
  const finishCommand = () => {
    if (currentCommand !== null) {
      commands.push({
        command: currentCommand,
        params: currentArgs.slice(0)
      });
      currentArgs = [];
      canParseCommandOrComma = true;
      switch (currentCommand) {
        case "M":
          currentCommand = "L";
          break;
        case "m":
          currentCommand = "l";
          break;
      }
    }
  };
  const parseNumber = () => {
    if (currentNumber !== "" && currentCommandType) {
      let value = Number(currentNumber);
      if (isNaN(value)) {
        throw new Error(`Invalid number "${currentNumber}" at ${i}`);
      }
      if (currentCommandType === ARC) {
        if (currentArgs.length < 2 && value <= 0) {
          throw new Error(
            `Expected positive number, got "${value}" at ${i}`
          );
        }
        while (true) {
          if (currentArgs.length < 3 || currentArgs.length > 4) {
            break;
          }
          if (currentNumber === "0" || currentNumber === "1") {
            break;
          }
          const slice = currentNumber.slice(0, 1);
          const newNumber = currentNumber.slice(1);
          const newValue = Number(newNumber);
          if (slice === "0" || slice === "1") {
            if (isNaN(newValue)) {
              throw new Error(
                `Invalid number "${currentNumber}" at ${i}`
              );
            }
            currentArgs.push(slice);
            currentNumber = newNumber;
            value = newValue;
            continue;
          }
          throw new Error(
            `Expected a flag, got "${currentNumber}" at ${i}`
          );
        }
      }
      currentArgs.push(currentNumber);
      if (currentArgs.length === argCount[currentCommandType]) {
        finishCommand();
      }
      currentNumber = "";
      currentNumberHasExpDigits = false;
      currentNumberHasExp = false;
      currentNumberHasDecimal = false;
      canParseCommandOrComma = true;
    }
  };
  for (i = 0; i < length; i++) {
    const char = path[i];
    const num = char.charCodeAt(0);
    if (isDigit(num)) {
      currentNumber += char;
      currentNumberHasExpDigits = currentNumberHasExp;
      continue;
    }
    if (char === "e" || char === "E") {
      currentNumber += char;
      currentNumberHasExp = true;
      continue;
    }
    if ((char === "-" || char === "+") && currentNumberHasExp && !currentNumberHasExpDigits) {
      currentNumber += char;
      continue;
    }
    if (char === "." && !currentNumberHasExp && !currentNumberHasDecimal) {
      currentNumber += char;
      currentNumberHasDecimal = true;
      continue;
    }
    parseNumber();
    if (isWhiteSpace(num)) {
      continue;
    }
    if (canParseCommandOrComma && char === ",") {
      canParseCommandOrComma = false;
      continue;
    }
    if (char === "+" || char === "-" || char === ".") {
      currentNumber = char;
      currentNumberHasDecimal = char === ".";
      continue;
    }
    if (currentArgs.length > 0) {
      throw new Error(`Unexpected command at ${i}`);
    }
    if (!canParseCommandOrComma) {
      throw new Error(`Command cannot follow comma at ${i}`);
    }
    canParseCommandOrComma = false;
    currentCommand = char;
    switch (char) {
      case "z":
      case "Z":
        commands.push({
          command: char,
          params: []
        });
        canParseCommandOrComma = true;
        currentCommandType = null;
        currentCommand = null;
        break;
      case "h":
      case "H":
        currentCommandType = HORIZ_LINE_TO;
        break;
      case "v":
      case "V":
        currentCommandType = VERT_LINE_TO;
        break;
      case "m":
      case "M":
        currentCommandType = MOVE_TO;
        break;
      case "l":
      case "L":
        currentCommandType = LINE_TO;
        break;
      case "c":
      case "C":
        currentCommandType = CURVE_TO;
        break;
      case "s":
      case "S":
        currentCommandType = SMOOTH_CURVE_TO;
        break;
      case "q":
      case "Q":
        currentCommandType = QUAD_TO;
        break;
      case "t":
      case "T":
        currentCommandType = SMOOTH_QUAD_TO;
        break;
      case "a":
      case "A":
        currentCommandType = ARC;
        break;
      default:
        throw new Error(`Unexpected character "${char}" at ${i}`);
    }
  }
  parseNumber();
  if (currentArgs.length) {
    if (!currentCommandType) {
      throw new Error("Empty path");
    }
    if (currentArgs.length !== argCount[currentCommandType]) {
      throw new Error(`Unexpected end of path at ${i}`);
    }
    finishCommand();
  }
  let output = "";
  commands.forEach((item) => {
    output += item.command;
    item.params.forEach((value, index) => {
      if (index > 0) {
        const char = value[0];
        switch (char) {
          case "-":
          case "+":
            break;
          case ".":
            if (index < 1) {
              break;
            }
            if (item.params[index - 1].includes(".")) {
              break;
            }
          default:
            output += " ";
        }
      }
      output += value;
    });
  });
  return output;
}
function deOptimisePaths(svg) {
  svg_parse.parseSVG(svg, (item) => {
    if (item.tagName !== "path") {
      return;
    }
    const d = item.element.attribs.d;
    if (typeof d === "string") {
      try {
        const optimised = cleanPath(d);
        if (optimised !== d) {
          item.$element.attr("d", optimised);
        }
      } catch (err) {
      }
    }
  });
}

exports.deOptimisePaths = deOptimisePaths;
