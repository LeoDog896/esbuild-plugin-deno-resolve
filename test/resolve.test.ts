import { build, stop } from "https://deno.land/x/esbuild@v0.14.48/mod.js";
import denoResolve from "../index.ts"
import { assert } from "https://deno.land/std@0.147.0/testing/asserts.ts";

Deno.test("URLs resolve", async () => {
  const result = await build({
    entryPoints: ["./test/basic.ts"],
    plugins: [denoResolve()],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js"
  })!

  const file = new TextDecoder().decode(result.outputFiles![0].contents)

  assert(file.includes("KeyMap"))

  stop()
})

Deno.test("Import maps resolve", async () => {
  const result = await build({
    entryPoints: ["./test/map.ts"],
    plugins: [denoResolve({
      imports: {
        "keycode/": "https://deno.land/x/cliffy@v0.24.2/keycode/"
      }
    })],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js"
  })!

  const file = new TextDecoder().decode(result.outputFiles![0].contents)

  assert(file.includes("KeyMap"))

  stop()
})