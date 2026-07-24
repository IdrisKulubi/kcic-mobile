import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const expectedTables = [
  "admins",
  "news",
  "opportunities",
  "opportunity_attachments",
  "partners",
  "programmes",
  "programme_sponsors",
  "team_members",
  "whistleblower_reports",
];

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL is not configured.");
  process.exit(1);
}

const sql = neon(process.env.POSTGRES_URL);
const rows = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name = any(${expectedTables})
  order by table_name
`;

const found = rows.map((row) => row.table_name);
const missing = expectedTables.filter((table) => !found.includes(table));

console.log(`found=${found.join(",")}`);
console.log(`missing=${missing.join(",")}`);

if (missing.length > 0) process.exit(1);
