/* Registers the "@/" alias resolver for plain `node` runs. */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-hook.mjs", pathToFileURL(import.meta.filename));
