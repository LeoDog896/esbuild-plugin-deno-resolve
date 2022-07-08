import { Plugin } from "https://deno.land/x/esbuild@v0.14.48/mod.js";
import { join } from "https://deno.land/std@0.147.0/path/mod.ts";

export default function entry(map: { imports: { [key: string] : string } } = { imports: { } }): Plugin {
  return {
    name: "deno-url",
    setup(build) {
      
      // Resolve import maps
      build.onResolve({ filter: /.*/ }, (args) => {
        
        if (args.namespace == "deno-url") {
          const { importer, path } = args

          return {
            path: join(importer, "../", path),
            namespace: "deno-url"
          }
        }

        const paths = Object.keys(map.imports);

        for (const path of paths) {
          if (path.endsWith("/")) {

            if (args.path.startsWith(path)) {

              const url = args.path.replace(path, map.imports[path]!)

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
                namespace: map.imports[path]!.startsWith("http") ? "deno-url" : undefined
              };
            }
          }
        }
      });

      build.onResolve({ filter: /^https?:\/\// }, args => ({
        path: args.path,
        namespace: 'deno-url',
      }))

      // Resolve urls
      build.onLoad({ filter: /.*/, namespace: "deno-url" }, async args => ({
        contents: await fetch(args.path).then(f => f.text()),
        loader: "ts",
        resolveDir: ".",
      }));
    },
  };
}