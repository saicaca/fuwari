# svelte2tsx

Converts [Svelte](https://svelte.dev) component source into TSX. The TSX can be type checked using the included `svelte-jsx.d.ts` and `svelte-shims.d.ts`.

_This project only converts svelte to tsx, type checking is left to consumers of this plugin such as language services_

```typescript
type SvelteCompiledToTsx = {
    code: string;
    map: import('magic-string').SourceMap;
};

export default function svelte2tsx(svelte: string): SvelteCompiledToTsx;
```

For example

Input.svelte

```svelte
<script>
    export let world = 'name';
</script>

<h1>hello {world}</h1>
```

will produce this ugly but type checkable TSX

```tsx
<></>;
function render() {
    let world = 'name';
    <>
        <h1>hello {world}</h1>
    </>;
    return { props: { world }, slots: {}, events: {} };
}

export default class _World_ extends __sveltets_2_createSvelte2TsxComponent(
    __sveltets_2_partial(__sveltets_2_with_any_event(render))
) {}
```

with a v3 SourceMap back to the original source.

For more examples of the transformations, see the `test/**/samples` folders

## Credits

-   [halfnelson](https://github.com/halfnelson) for creating `svelte2tsx`
-   [pushkine](https://github.com/pushkine) for creating the source mapping test infrastructure
