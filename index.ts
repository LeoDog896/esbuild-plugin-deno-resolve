import { Plugin } from "https://deno.land/x/esbuild@v0.14.48/mod.js";
import { join } from "https://deno.land/std@0.147.0/path/mod.ts";

function resolveURL(path: string, importer: string) {
  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${importer.startsWith("http") ? "http" : "https"}://${importer.split("/")[2]}${path}`;
  }

  return join(importer, "../", path);


}

export default function entry(
  map: { imports: { [key: string]: string } } = { imports: {} },
): Plugin {
  return {
    name: "deno-url",
    setup(build) {
      // Resolve import maps
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.namespace == "deno-url") {
          const { importer, path } = args;

          return {
            path: resolveURL(path, importer),
            namespace: "deno-url",
          };
        }

        const paths = Object.keys(map.imports);

        for (const path of paths) {
          if (path.endsWith("/")) {
            if (args.path.startsWith(path)) {
              const url = args.path.replace(path, map.imports[path]!);

              return {
                path: url.startsWith("http") ? url : join(
                  Deno.cwd(),
                  url,
                ),
                namespace: url.startsWith("http") ? "deno-url" : undefined,
              };
            }
          } else {
            if (path === args.path) {
              return {
                path: map.imports[path]!,
                namespace: map.imports[path]!.startsWith("http")
                  ? "deno-url"
                  : undefined,
              };
            }
          }
        }
      });

      build.onResolve({ filter: /^https?:\/\// }, (args) => ({
        path: args.path,
        namespace: "deno-url",
      }));

      // Resolve urls
      build.onLoad({ filter: /.*/, namespace: "deno-url" }, async (args) => {
        try {
          const response = await fetch(args.path);

          if (response.status !== 200) {
            response.body?.cancel()
            return {
              errors: [{
                text: `Could not resolve ${args.path}: ${response.status}`,
              }],
            };
          }

          return {
            contents: await response.text(),
            loader: "ts",
            resolveDir: ".",
          };
        } catch (e) {
          return {
            errors: [{
              text: `Could not resolve ${args.path}: ${e.message}`,
            }],
          };
        }
      });
    },
  };
}
