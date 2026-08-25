/* Minimal .env.local loader — avoids adding dotenv for one script. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "..", ".env.local");
for (const line of readFileSync(file, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (v) process.env[m[1]] ??= v;
}
