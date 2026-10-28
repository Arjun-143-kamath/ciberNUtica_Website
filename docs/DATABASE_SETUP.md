# Local PostgreSQL setup

1. Copy `.env.example` to `.env` and set unique values for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `FLAG_PEPPER`, `POSTGRES_PASSWORD`, and `DATABASE_URL`. Use the same password in `POSTGRES_PASSWORD` and the `DATABASE_URL` password portion.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Apply the checked-in schema with `npm run db:migrate`.
4. Create or refresh the administrator and load the initial events, dispatches, and challenges with `npm run db:seed`.
5. Start the app with `npm run dev`.

Use `npm run db:migrate -- --name <migration-name>` when changing the Prisma schema. For production deployments, set `DATABASE_URL` to a managed PostgreSQL service and run `npm run db:deploy` as the release migration step. Do not commit `.env` or database backups.

Accounts, blog dispatches, events, challenges, flags, hints, submissions, solves, hint unlocks, and scoreboard freeze state are stored in PostgreSQL. Static flags are HMAC-hashed and regex patterns are AES-GCM encrypted with keys derived from `FLAG_PEPPER`; keep this secret backed up and private because it is required to verify flags.
