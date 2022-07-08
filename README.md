# esbuild-plugin-deno-resolve

This is a plugin made in deno that resolves deno import maps and URL imports.

## Usage

```ts
import denoResolve from "https://deno.land/x/esbuild_plugin_deno_resolve/index.ts"

esbuild.build({
  ...,
  plugins: [denoResolve()],
})
```

Permissions: `--allow-env --allow-read --allow-write --allow-run`