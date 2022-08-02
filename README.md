# esbuild-plugin-deno-resolve

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/LeoDog896/esbuild-plugin-deno-resolve)

This is a plugin made in deno that resolves deno import maps and URL imports.

## Usage

```ts
import denoResolve from "https://deno.land/x/esbuild_plugin_deno_resolve/index.ts"

esbuild.build({
  ...,
  plugins: [denoResolve(JSON.parse(await Deno.readTextFile("import_map.json")))],
})
```

Permissions: `--allow-env --allow-read --allow-write --allow-run`
