import { build, stop } from "https://deno.land/x/esbuild@v0.14.48/mod.js";
import denoResolve from "../index.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.147.0/testing/asserts.ts";

Deno.test("URLs resolve", async () => {
  const result = await build({
    entryPoints: ["./test/basic.ts"],
    plugins: [denoResolve()],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js",
  })!;

  const file = new TextDecoder().decode(result.outputFiles![0].contents);

  assert(file.includes("KeyMap"));

  stop();
});

Deno.test("Import maps resolve with trailing slash", async () => {
  const result = await build({
    entryPoints: ["./test/map.ts"],
    plugins: [denoResolve({
      imports: {
        "keycode/": "https://deno.land/x/cliffy@v0.24.2/keycode/",
      },
    })],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js",
  })!;

  const file = new TextDecoder().decode(result.outputFiles![0].contents);

  assert(file.includes("KeyMap"));

  stop();
});

Deno.test("Import maps resolve with no trailing slash", async () => {
  const result = await build({
    entryPoints: ["./test/map-basic.ts"],
    plugins: [denoResolve({
      imports: {
        "keycode": "https://deno.land/x/cliffy@v0.24.2/keycode/mod.ts",
      },
    })],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js",
  })!;

  const file = new TextDecoder().decode(result.outputFiles![0].contents);

  assert(file.includes("KeyMap"));

  stop();
});

Deno.test("Non-existant URLs (no known domain) throws an error", async () => {
  try {
    await build({
      entryPoints: ["./test/non-existant.ts"],
      plugins: [denoResolve({
        imports: {
          "url/": "https://some.non.existent.url/",
        },
      })],
      bundle: true,
      write: false,
      format: "esm",
      outfile: "bundle.js",
      logLevel: "silent",
    });

    assert(false, "Should have thrown an error");
  } catch {
    assert(true);
  }

  stop()
});

Deno.test("Non-existant URLs (404) throws an error", async () => {
  try {
    await build({
      entryPoints: ["./test/non-existant.ts"],
      plugins: [denoResolve({
        imports: {
          "url/": "https://deno.land/x/non-existant-package/",
        },
      })],
      bundle: true,
      write: false,
      format: "esm",
      outfile: "bundle.js",
      logLevel: "silent",
    });

    assert(false, "Should have thrown an error");
  } catch {
    assert(true);
  }

  stop();
});

Deno.test("Real world use case works (esm.sh)", async () => {
  await build({
    entryPoints: ["./test/react.ts"],
    plugins: [denoResolve({
      imports: {
        "react": "https://esm.sh/react",
      },
    })],
    bundle: true,
    write: false,
    format: "esm",
    outfile: "bundle.js",
    logLevel: "silent",
  });

  stop();
});