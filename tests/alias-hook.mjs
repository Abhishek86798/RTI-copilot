/* Resolves the "@/" alias and extensionless TS imports for plain `node` runs
   (the project has no tsx/bundler installed; Node 24 strips types natively). */
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve as resolvePath, dirname } from "node:path";
import { existsSync } from "node:fs";

const ROOT = resolvePath(import.meta.dirname, "..");

function firstExisting(base) {
  for (const c of [`${base}.ts`, `${base}.tsx`, `${base}.json`, base, resolvePath(base, "index.ts")]) {
    if (existsSync(c) && !c.endsWith("/")) return c;
  }
  return null;
}

export function resolve(specifier, context, next) {
  let base = null;

  if (specifier.startsWith("@/")) {
    base = resolvePath(ROOT, specifier.slice(2));
  } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
  }

  if (base) {
    const hit = firstExisting(base);
    if (hit) {
      // Bundlers add the JSON import attribute implicitly; plain node does not.
      const ctx = hit.endsWith(".json")
        ? { ...context, importAttributes: { ...context.importAttributes, type: "json" } }
        : context;
      return next(pathToFileURL(hit).href, ctx);
    }
  }
  return next(specifier, context);
}

export function load(url, context, next) {
  if (url.endsWith(".json")) {
    return next(url, { ...context, importAttributes: { type: "json" }, format: "json" });
  }
  return next(url, context);
}
