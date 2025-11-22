const errorMap = (baseError, ctx) => {
  const baseErrorPath = flattenErrorPath(baseError.path);
  if (baseError.code === "invalid_union") {
    let typeOrLiteralErrByPath = /* @__PURE__ */ new Map();
    for (const unionError of baseError.unionErrors.map((e) => e.errors).flat()) {
      if (unionError.code === "invalid_type" || unionError.code === "invalid_literal") {
        const flattenedErrorPath = flattenErrorPath(unionError.path);
        if (typeOrLiteralErrByPath.has(flattenedErrorPath)) {
          typeOrLiteralErrByPath.get(flattenedErrorPath).expected.push(unionError.expected);
        } else {
          typeOrLiteralErrByPath.set(flattenedErrorPath, {
            code: unionError.code,
            received: unionError.received,
            expected: [unionError.expected]
          });
        }
      }
    }
    const messages = [prefix(baseErrorPath, "Did not match union.")];
    const details = [...typeOrLiteralErrByPath.entries()].filter(([, error]) => error.expected.length === baseError.unionErrors.length).map(
      ([key, error]) => key === baseErrorPath ? (
        // Avoid printing the key again if it's a base error
        `> ${getTypeOrLiteralMsg(error)}`
      ) : `> ${prefix(key, getTypeOrLiteralMsg(error))}`
    );
    if (details.length === 0) {
      const expectedShapes = [];
      for (const unionError of baseError.unionErrors) {
        const expectedShape = [];
        for (const issue of unionError.issues) {
          if (issue.code === "invalid_union") {
            return errorMap(issue, ctx);
          }
          const relativePath = flattenErrorPath(issue.path).replace(baseErrorPath, "").replace(leadingPeriod, "");
          if ("expected" in issue && typeof issue.expected === "string") {
            expectedShape.push(
              relativePath ? `${relativePath}: ${issue.expected}` : issue.expected
            );
          } else {
            expectedShape.push(relativePath);
          }
        }
        if (expectedShape.length === 1 && !expectedShape[0]?.includes(":")) {
          expectedShapes.push(expectedShape.join(""));
        } else {
          expectedShapes.push(`{ ${expectedShape.join("; ")} }`);
        }
      }
      if (expectedShapes.length) {
        details.push("> Expected type `" + expectedShapes.join(" | ") + "`");
        details.push("> Received `" + stringify(ctx.data) + "`");
      }
    }
    return {
      message: messages.concat(details).join("\n")
    };
  } else if (baseError.code === "invalid_literal" || baseError.code === "invalid_type") {
    return {
      message: prefix(
        baseErrorPath,
        getTypeOrLiteralMsg({
          code: baseError.code,
          received: baseError.received,
          expected: [baseError.expected]
        })
      )
    };
  } else if (baseError.message) {
    return { message: prefix(baseErrorPath, baseError.message) };
  } else {
    return { message: prefix(baseErrorPath, ctx.defaultError) };
  }
};
const getTypeOrLiteralMsg = (error) => {
  if (typeof error.received === "undefined" || error.received === "undefined") return "Required";
  const expectedDeduped = new Set(error.expected);
  switch (error.code) {
    case "invalid_type":
      return `Expected type \`${unionExpectedVals(expectedDeduped)}\`, received \`${stringify(
        error.received
      )}\``;
    case "invalid_literal":
      return `Expected \`${unionExpectedVals(expectedDeduped)}\`, received \`${stringify(
        error.received
      )}\``;
  }
};
const prefix = (key, msg) => key.length ? `**${key}**: ${msg}` : msg;
const unionExpectedVals = (expectedVals) => [...expectedVals].map((expectedVal) => stringify(expectedVal)).join(" | ");
const flattenErrorPath = (errorPath) => errorPath.join(".");
const stringify = (val) => JSON.stringify(val, null, 1).split(newlinePlusWhitespace).join(" ");
const newlinePlusWhitespace = /\n\s*/;
const leadingPeriod = /^\./;
export {
  errorMap
};
