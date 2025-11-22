# Custom Data for HTML Language Service

In VS Code, there are two ways of loading custom HTML datasets:

1. With setting `html.customData`
2. With an extension that contributes `contributes.html.customData`

Both setting point to a list of JSON files. This document describes the shape of the JSON files.

You can read more about custom data at: https://github.com/microsoft/vscode-custom-data.

## Custom Data Format

The JSON have one required property, `version` and 3 other top level properties:

```jsonc
{
  "version": 1.1,
  "tags": [],
  "globalAttributes": [],
  "valueSets": []
}
```

Version denotes the schema version you are using. The latest schema version is `V1.1`.

You can find other properties' shapes at [htmlLanguageTypes.ts](../src/htmlLanguageTypes.ts) or the [JSON Schema](./customData.schema.json).

When working with VSCode, you should suffix your custom data file with `.html-data.json`, so VS Code will load the most recent schema for the JSON file.

[html5.ts](../src/languageFacts/data/webCustomData.ts) contains that built-in dataset that conforms to the spec.

## Language Features

Custom data receives the following language features:

- Completion on tag, attribute and attribute value
- Hover on tag (here's the [issue](https://github.com/Microsoft/vscode-html-languageservice/issues/47) for hover on attribute / attribute-name)

For example, for the following custom data:

```json
{
  "tags": [
    {
      "name": "foo",
      "description": "The foo element",
      "attributes": [
        { "name": "bar" },
        {
          "name": "baz",
          "values": [
            {
              "name": "baz-val-1"
            }
          ]
        }
      ]
    }
  ],
  "globalAttributes": [
    { "name": "fooAttr", "description": "Foo Attribute" },
    { "name": "xattr", "description": "X attributes", "valueSet": "x" }
  ],
  "valueSets": [
    {
      "name": "x",
      "values": [
        {
          "name": "xval",
          "description": "x value"
        }
      ]
    }
  ]
}
```

- Completion on `<|` will provide `foo`
- Completion on `<foo |` will provide `bar` and `baz`
- Completion on `<foo baz=|` will provide `baz-val-1`
- Completion on `<foo |` will also provide the global attributes `fooAttr` and `xattr`
- Completion on `<foo xattr=>` will provide all values in valueSet `x`, which is `xval`
- Hover on `foo` will show `The foo element`

### Additional properties

For either `tag`, `attribute` or `attributeValue`, you can provide a `references` property of the following form

```json
{
  "tags": [
    {
      "name": "foo",
      "description": "The foo element",
      "references": [
        {
          "name": "My foo element reference",
          "url": "https://www.foo.com/element/foo"
        }
      ]
    }
  ]
}
```

It will be displayed in Markdown form in completion and hover as `[My foo element reference](https://www.foo.com/element/foo)`.