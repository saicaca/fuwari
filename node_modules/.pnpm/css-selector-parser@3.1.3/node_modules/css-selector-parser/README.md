# css-selector-parser

![npm](https://img.shields.io/npm/v/css-selector-parser)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/css-selector-parser)
![NPM License](https://img.shields.io/npm/l/css-selector-parser)
![GitHub stars](https://img.shields.io/github/stars/mdevils/css-selector-parser)

A high-performance CSS selector parser with advanced features for modern web development.

## Features

- 🚀 **Fast and memory-efficient** parsing for all CSS selectors
- 🌳 **AST-based** object model for programmatic manipulation
- 📊 **Full compliance** with all CSS selector specifications
- 🧪 **Comprehensive test coverage** 
- 📚 **Well-documented API** with TypeScript support
- 🔄 **Two-way conversion** between CSS selectors and AST
- 🧩 **Modular support** for various CSS specifications

## Supported CSS Selector Standards

- `css1`: [W3C CSS1 Specification](https://www.w3.org/TR/CSS1/)
- `css2`: [W3C CSS2 Specification](https://www.w3.org/TR/CSS2/)
- `css3`/`selectors-3`: [W3C Selectors Level 3](https://www.w3.org/TR/selectors-3/)
- `selectors-4`: [W3C Selectors Level 4](https://www.w3.org/TR/selectors-4/)
- `latest`: refers to `selectors-4`
- `progressive`: `latest` + accepts unknown pseudo-classes, pseudo-elements and attribute case sensitivity modifiers

## Migration Guides

- [Migrating from 1.x to 3.x](CHANGELOG.md#migrating-from-1x-to-3x)
- [Migrating from 2.x to 3.x](CHANGELOG.md#migrating-from-2x-to-3x)
- [Migrating from 1.x to 2.x](CHANGELOG.md#220)

See [Changelog](CHANGELOG.md) for release details.

## Installation

```bash
npm install css-selector-parser
# or
yarn add css-selector-parser
# or
pnpm add css-selector-parser
```

## Usage

### Parsing Selectors

```javascript
import { createParser } from 'css-selector-parser';

const parse = createParser();
const selector = parse('a[href^="/"], .container:has(nav) > a[href]:nth-child(2)::before');

console.log(selector);
```

This produces an AST (Abstract Syntax Tree) output:

```javascript
({
    type: 'Selector',
    rules: [
        {
            type: 'Rule',
            items: [
                { type: 'TagName', name: 'a' },
                {
                    type: 'Attribute',
                    name: 'href',
                    operator: '^=',
                    value: { type: 'String', value: '/' }
                }
            ]
        },
        {
            type: 'Rule',
            items: [
                { type: 'ClassName', name: 'container' },
                {
                    type: 'PseudoClass',
                    name: 'has',
                    argument: {
                        type: 'Selector',
                        rules: [
                            {
                                type: 'Rule',
                                items: [ { type: 'TagName', name: 'nav' } ]
                            }
                        ]
                    }
                }
            ],
            nestedRule: {
                type: 'Rule',
                items: [
                    { type: 'TagName', name: 'a' },
                    { type: 'Attribute', name: 'href' },
                    {
                        type: 'PseudoClass',
                        name: 'nth-child',
                        argument: { type: 'Formula', a: 0, b: 2 }
                    },
                    {
                        type: 'PseudoElement',
                        name: 'before'
                    }
                ],
                combinator: '>'
            }
        }
    ]
})
```

### Building and Rendering Selectors

```javascript
import { ast, render } from 'css-selector-parser';

const selector = ast.selector({
    rules: [
        ast.rule({
            items: [
                ast.tagName({name: 'a'}),
                ast.attribute({name: 'href', operator: '^=', value: ast.string({value: '/'})})
            ]
        }),
        ast.rule({
            items: [
                ast.className({name: 'container'}),
                ast.pseudoClass({
                    name: 'has',
                    argument: ast.selector({
                        rules: [ast.rule({items: [ast.tagName({name: 'nav'})]})]
                    })
                })
            ],
            nestedRule: ast.rule({
                combinator: '>',
                items: [
                    ast.tagName({name: 'a'}),
                    ast.attribute({name: 'href'}),
                    ast.pseudoClass({
                        name: 'nth-child',
                        argument: ast.formula({a: 0, b: 2})
                    }),
                    ast.pseudoElement({name: 'before'})
                ]
            })
        })
    ]
});

console.log(render(selector)); // a[href^="/"], .container:has(nav) > a[href]:nth-child(2)::before
```

## CSS Modules Support

CSS Modules are specifications that add new selectors or modify existing ones. This parser supports various CSS modules that can be included in your syntax definition:

```javascript
import { createParser } from 'css-selector-parser';

// Create a parser with specific CSS modules enabled
const parse = createParser({
    syntax: 'selectors-4',
    modules: ['css-position-3', 'css-scoping-1']
});
```

### Supported CSS Modules

| Module | Description |
|--------|-------------|
| `css-position-1/2/3/4` | Position-related pseudo-classes |
| `css-scoping-1` | Shadow DOM selectors (`:host`, `:host-context()`, `::slotted()`) |
| `css-pseudo-4` | Modern pseudo-elements (`::selection`, `::backdrop`, etc.) |
| `css-shadow-parts-1` | `::part()` for styling shadow DOM components |

The `latest` syntax automatically includes all modules marked as current specifications.

## API Documentation

- [Complete API Documentation](docs/modules.md)
- [Parsing CSS Selectors](docs/modules.md#createParser)
- [Constructing CSS AST](docs/modules.md#ast)
- [Rendering CSS AST](docs/modules.md#render)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Security Contact

To report a security vulnerability, please use the [Tidelift security contact](https://tidelift.com/security). Tidelift will coordinate the fix and disclosure.

## Sponsorship

If you find this project useful, please consider [sponsoring the developer](https://github.com/sponsors/mdevils) or [supporting on Patreon](https://patreon.com/mdevils).
