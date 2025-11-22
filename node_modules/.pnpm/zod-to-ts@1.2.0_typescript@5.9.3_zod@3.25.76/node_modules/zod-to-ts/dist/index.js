// src/index.ts
import ts2 from "typescript";

// src/types.ts
var resolveOptions = (raw) => {
  const resolved = {
    nativeEnums: raw?.resolveNativeEnums ? "resolve" : "identifier"
  };
  return { ...resolved, ...raw };
};

// src/utils.ts
import ts from "typescript";
var { factory: f, SyntaxKind, ScriptKind, ScriptTarget, EmitHint } = ts;
var maybeIdentifierToTypeReference = (identifier) => {
  if (ts.isIdentifier(identifier)) {
    return f.createTypeReferenceNode(identifier);
  }
  return identifier;
};
var createTypeReferenceFromString = (identifier) => f.createTypeReferenceNode(f.createIdentifier(identifier));
var createUnknownKeywordNode = () => f.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
var createTypeAlias = (node, identifier, comment) => {
  const typeAlias = f.createTypeAliasDeclaration(
    void 0,
    f.createIdentifier(identifier),
    void 0,
    node
  );
  if (comment) {
    addJsDocComment(typeAlias, comment);
  }
  return typeAlias;
};
var printNode = (node, printerOptions) => {
  const sourceFile = ts.createSourceFile("print.ts", "", ScriptTarget.Latest, false, ScriptKind.TS);
  const printer = ts.createPrinter(printerOptions);
  return printer.printNode(EmitHint.Unspecified, node, sourceFile);
};
var withGetType = (schema, getType) => {
  schema._def.getType = getType;
  return schema;
};
var identifierRE = /^[$A-Z_a-z][\w$]*$/;
var getIdentifierOrStringLiteral = (string_) => {
  if (identifierRE.test(string_)) {
    return f.createIdentifier(string_);
  }
  return f.createStringLiteral(string_);
};
var addJsDocComment = (node, text) => {
  ts.addSyntheticLeadingComment(node, SyntaxKind.MultiLineCommentTrivia, `* ${text} `, true);
};

// src/index.ts
var { factory: f2, SyntaxKind: SyntaxKind2 } = ts2;
var callGetType = (zod, identifier, options) => {
  let type;
  if (zod._def.getType)
    type = zod._def.getType(ts2, identifier, options);
  return type;
};
var zodToTs = (zod, identifier, options) => {
  const resolvedIdentifier = identifier ?? "Identifier";
  const resolvedOptions = resolveOptions(options);
  const store = { nativeEnums: [] };
  const node = zodToTsNode(zod, resolvedIdentifier, store, resolvedOptions);
  return { node, store };
};
var zodToTsNode = (zod, identifier, store, options) => {
  const typeName = zod._def.typeName;
  const getTypeType = callGetType(zod, identifier, options);
  if (getTypeType && typeName !== "ZodNativeEnum") {
    return maybeIdentifierToTypeReference(getTypeType);
  }
  const otherArguments = [identifier, store, options];
  switch (typeName) {
    case "ZodString": {
      return f2.createKeywordTypeNode(SyntaxKind2.StringKeyword);
    }
    case "ZodNumber": {
      return f2.createKeywordTypeNode(SyntaxKind2.NumberKeyword);
    }
    case "ZodBigInt": {
      return f2.createKeywordTypeNode(SyntaxKind2.BigIntKeyword);
    }
    case "ZodBoolean": {
      return f2.createKeywordTypeNode(SyntaxKind2.BooleanKeyword);
    }
    case "ZodDate": {
      return f2.createTypeReferenceNode(f2.createIdentifier("Date"));
    }
    case "ZodUndefined": {
      return f2.createKeywordTypeNode(SyntaxKind2.UndefinedKeyword);
    }
    case "ZodNull": {
      return f2.createLiteralTypeNode(f2.createNull());
    }
    case "ZodVoid": {
      return f2.createUnionTypeNode([
        f2.createKeywordTypeNode(SyntaxKind2.VoidKeyword),
        f2.createKeywordTypeNode(SyntaxKind2.UndefinedKeyword)
      ]);
    }
    case "ZodAny": {
      return f2.createKeywordTypeNode(SyntaxKind2.AnyKeyword);
    }
    case "ZodUnknown": {
      return createUnknownKeywordNode();
    }
    case "ZodNever": {
      return f2.createKeywordTypeNode(SyntaxKind2.NeverKeyword);
    }
    case "ZodLazy": {
      if (!getTypeType)
        return createTypeReferenceFromString(identifier);
      break;
    }
    case "ZodLiteral": {
      let literal;
      const literalValue = zod._def.value;
      switch (typeof literalValue) {
        case "number": {
          literal = f2.createNumericLiteral(literalValue);
          break;
        }
        case "boolean": {
          literal = literalValue === true ? f2.createTrue() : f2.createFalse();
          break;
        }
        default: {
          literal = f2.createStringLiteral(literalValue);
          break;
        }
      }
      return f2.createLiteralTypeNode(literal);
    }
    case "ZodObject": {
      const properties = Object.entries(zod._def.shape());
      const members = properties.map(([key, value]) => {
        const nextZodNode = value;
        const type = zodToTsNode(nextZodNode, ...otherArguments);
        const { typeName: nextZodNodeTypeName } = nextZodNode._def;
        const isOptional = nextZodNodeTypeName === "ZodOptional" || nextZodNode.isOptional();
        const propertySignature = f2.createPropertySignature(
          void 0,
          getIdentifierOrStringLiteral(key),
          isOptional ? f2.createToken(SyntaxKind2.QuestionToken) : void 0,
          type
        );
        if (nextZodNode.description) {
          addJsDocComment(propertySignature, nextZodNode.description);
        }
        return propertySignature;
      });
      return f2.createTypeLiteralNode(members);
    }
    case "ZodArray": {
      const type = zodToTsNode(zod._def.type, ...otherArguments);
      const node = f2.createArrayTypeNode(type);
      return node;
    }
    case "ZodEnum": {
      const types = zod._def.values.map((value) => f2.createLiteralTypeNode(f2.createStringLiteral(value)));
      return f2.createUnionTypeNode(types);
    }
    case "ZodUnion": {
      const options2 = zod._def.options;
      const types = options2.map((option) => zodToTsNode(option, ...otherArguments));
      return f2.createUnionTypeNode(types);
    }
    case "ZodDiscriminatedUnion": {
      const options2 = [...zod._def.options.values()];
      const types = options2.map((option) => zodToTsNode(option, ...otherArguments));
      return f2.createUnionTypeNode(types);
    }
    case "ZodEffects": {
      const node = zodToTsNode(zod._def.schema, ...otherArguments);
      return node;
    }
    case "ZodNativeEnum": {
      const type = getTypeType;
      if (options.nativeEnums === "union") {
        if (type)
          return maybeIdentifierToTypeReference(type);
        const types = Object.values(zod._def.values).map((value) => {
          if (typeof value === "number") {
            return f2.createLiteralTypeNode(f2.createNumericLiteral(value));
          }
          return f2.createLiteralTypeNode(f2.createStringLiteral(value));
        });
        return f2.createUnionTypeNode(types);
      }
      if (!type)
        return createUnknownKeywordNode();
      if (options.nativeEnums === "resolve") {
        const enumMembers = Object.entries(zod._def.values).map(([key, value]) => {
          const literal = typeof value === "number" ? f2.createNumericLiteral(value) : f2.createStringLiteral(value);
          return f2.createEnumMember(
            getIdentifierOrStringLiteral(key),
            literal
          );
        });
        if (ts2.isIdentifier(type)) {
          store.nativeEnums.push(
            f2.createEnumDeclaration(
              void 0,
              type,
              enumMembers
            )
          );
        } else {
          throw new Error('getType on nativeEnum must return an identifier when nativeEnums is "resolve"');
        }
      }
      return maybeIdentifierToTypeReference(type);
    }
    case "ZodOptional": {
      const innerType = zodToTsNode(zod._def.innerType, ...otherArguments);
      return f2.createUnionTypeNode([
        innerType,
        f2.createKeywordTypeNode(SyntaxKind2.UndefinedKeyword)
      ]);
    }
    case "ZodNullable": {
      const innerType = zodToTsNode(zod._def.innerType, ...otherArguments);
      return f2.createUnionTypeNode([
        innerType,
        f2.createLiteralTypeNode(f2.createNull())
      ]);
    }
    case "ZodTuple": {
      const types = zod._def.items.map((option) => zodToTsNode(option, ...otherArguments));
      return f2.createTupleTypeNode(types);
    }
    case "ZodRecord": {
      const valueType = zodToTsNode(zod._def.valueType, ...otherArguments);
      const node = f2.createTypeLiteralNode([f2.createIndexSignature(
        void 0,
        [f2.createParameterDeclaration(
          void 0,
          void 0,
          f2.createIdentifier("x"),
          void 0,
          f2.createKeywordTypeNode(SyntaxKind2.StringKeyword)
        )],
        valueType
      )]);
      return node;
    }
    case "ZodMap": {
      const valueType = zodToTsNode(zod._def.valueType, ...otherArguments);
      const keyType = zodToTsNode(zod._def.keyType, ...otherArguments);
      const node = f2.createTypeReferenceNode(
        f2.createIdentifier("Map"),
        [
          keyType,
          valueType
        ]
      );
      return node;
    }
    case "ZodSet": {
      const type = zodToTsNode(zod._def.valueType, ...otherArguments);
      const node = f2.createTypeReferenceNode(
        f2.createIdentifier("Set"),
        [type]
      );
      return node;
    }
    case "ZodIntersection": {
      const left = zodToTsNode(zod._def.left, ...otherArguments);
      const right = zodToTsNode(zod._def.right, ...otherArguments);
      const node = f2.createIntersectionTypeNode([left, right]);
      return node;
    }
    case "ZodPromise": {
      const type = zodToTsNode(zod._def.type, ...otherArguments);
      const node = f2.createTypeReferenceNode(
        f2.createIdentifier("Promise"),
        [type]
      );
      return node;
    }
    case "ZodFunction": {
      const argumentTypes = zod._def.args._def.items.map((argument, index) => {
        const argumentType = zodToTsNode(argument, ...otherArguments);
        return f2.createParameterDeclaration(
          void 0,
          void 0,
          f2.createIdentifier(`args_${index}`),
          void 0,
          argumentType
        );
      });
      argumentTypes.push(
        f2.createParameterDeclaration(
          void 0,
          f2.createToken(SyntaxKind2.DotDotDotToken),
          f2.createIdentifier(`args_${argumentTypes.length}`),
          void 0,
          f2.createArrayTypeNode(createUnknownKeywordNode())
        )
      );
      const returnType = zodToTsNode(zod._def.returns, ...otherArguments);
      const node = f2.createFunctionTypeNode(
        void 0,
        argumentTypes,
        returnType
      );
      return node;
    }
    case "ZodDefault": {
      const type = zodToTsNode(zod._def.innerType, ...otherArguments);
      const filteredNodes = [];
      type.forEachChild((node) => {
        if (![SyntaxKind2.UndefinedKeyword].includes(node.kind)) {
          filteredNodes.push(node);
        }
      });
      type.types = filteredNodes;
      return type;
    }
  }
  return f2.createKeywordTypeNode(SyntaxKind2.AnyKeyword);
};
export {
  createTypeAlias,
  printNode,
  withGetType,
  zodToTs
};
