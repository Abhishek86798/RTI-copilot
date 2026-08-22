/** Applies drizzle/*.sql to the database in DATABASE_URL. */
import { readFileSync, readdirSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

const sql = neon(process.env.DATABASE_URL);
for (const file of readdirSync("drizzle").filter((f) => f.endsWith(".sql")).sort()) {
  const body = readFileSync(`drizzle/${file}`, "utf8");
  for (const stmt of body.split("--> statement-breakpoint")) {
    const trimmed = stmt.trim();
    if (trimmed) await sql.query(trimmed);
  }
  console.log(`applied ${file}`);
}
console.log("schema is up to date");
