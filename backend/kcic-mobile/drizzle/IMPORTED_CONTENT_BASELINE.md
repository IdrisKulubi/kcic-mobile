# Imported content baseline

The website content tables declared in `db/content-schema.ts` already exist in
the shared Neon database and contain production data. They are intentionally
not represented by a `CREATE TABLE` migration in this repository.

Before generating or applying a future Drizzle migration:

1. Confirm `POSTGRES_URL` points to the imported Neon branch.
2. Run `drizzle-kit pull` into a temporary directory.
3. Compare the pulled schema with `db/content-schema.ts`.
4. Generate only additive or explicitly reviewed changes.

Never run the original website import or a generated baseline migration against
the populated shared database.
