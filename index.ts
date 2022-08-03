import { Plugin } from "https://deno.land/x/esbuild@v0.14.51/mod.js";
import { join } from "https://deno.land/std@0.150.0/path/mod.ts";

function resolveURL(path: string, importer: string) {
  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${importer.startsWith("http") ? "http" : "https"}://${
      importer.split("/")[2]
    }${path}`;
  }

  return join(importer, "../", path);
}

export async function simpleURLResolve(path: string): Promise<string> {
  const response = await fetch(path);

  if (response.status !== 200) {
    response.body?.cancel();
    throw Error(response.status.toString())
  }

  return await response.text()
}

/**
 * Returns an esbuild plugin for resolving deno modules.
 * 
 * @param map The import map in JSON format
 * @param urlResolve Specifies a URL resolving function. The default uses the Deno cache
 */
export default (
  map: { imports: { [key: string]: string } } = { imports: {} },
  urlResolve: (url: string) => Promise<string> | string = simpleURLResolve,
): Plugin => ({
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

      for (const [path, rawURL] of Object.entries(map.imports)) {
        if (path.endsWith("/")) {
          if (args.path.startsWith(path)) {
            const url = args.path.replace(path, rawURL);

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
              path: rawURL,
              namespace: rawURL.startsWith("http") ? "deno-url" : undefined,
            };
          }
        }
      }
    });

    // Mark any https? url with deno-url
    build.onResolve({ filter: /^https?:\/\// }, (args) => ({
      path: args.path,
      namespace: "deno-url",
    }));

    // Fetch the newly parsed URLs
    build.onLoad({ filter: /.*/, namespace: "deno-url" }, async (args) => {
      try {
        return {
          contents: await urlResolve(args.path),
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
});
