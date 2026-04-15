## Database Source of Truth

The Laravel migrations in `database/migrations` are the source of truth for the schema.

Rules:

- Add or change schema through a migration.
- Keep `database/sunupark_db.sql` only as a legacy snapshot for manual inspection.
- Do not update the SQL dump as part of normal feature work.
- Rebuild local and test databases with `php artisan migrate` or `php artisan migrate:fresh --seed`.

Notes:

- Sanctum tokens now require the `personal_access_tokens` migration.
- Automated tests are expected to run from migrations only.
