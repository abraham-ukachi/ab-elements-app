# `database/` 🗄️

The MySQL 8 schema for **abElements** ([`schema.sql`](./schema.sql)). Design only: nothing has been created on Vercel yet.
The full table-by-table reference and the ER diagram live in the main [README](../README.md#database).

## Provider (recommended): TiDB Cloud Starter via the Vercel Marketplace

| | |
|:--|:--|
| Why | Free tier (up to 5 instances, 5 GiB row storage + 50M RUs / month each), MySQL 8 compatible, enforced foreign keys (GA since TiDB v8.5), HTTP serverless driver for Vercel Functions, branching for previews. |
| Integration | [vercel.com/marketplace/tidb-cloud](https://vercel.com/marketplace/tidb-cloud) - connects an existing Starter instance and injects `DATABASE_URL` / `TIDB_*` env vars. |
| Driver | [`@tidbcloud/serverless`](https://docs.pingcap.com/developer/serverless-driver/) (HTTP, backend only) or any MySQL driver over TLS. |
| Alternative | [PlanetScale](https://planetscale.com/docs/vitess/tutorials/deployments/deploy-to-vercel) (Vitess, paid only). Enable **Settings > Allow foreign key constraints** (unsharded DBs). |

> NOTE: Vercel's own AWS Marketplace integration offers Aurora **PostgreSQL**, Aurora DSQL and DynamoDB, not MySQL.

## Apply the schema

```sh
# MySQL 8 / TiDB (TLS required on TiDB Cloud)
mysql --host "$TIDB_HOST" --port 4000 --user "$TIDB_USER" -p --ssl-mode=VERIFY_IDENTITY \
      --database ab_elements < database/schema.sql
```

- Test-applied on **MySQL 8.4.6** and **TiDB v8.5.8**: 29 tables, 41 foreign keys, seed rows for `locales`, `packages` and `doc_versions`.
- TiDB ignores `CHECK` constraints unless `tidb_enable_check_constraint = ON`: validate enum-like values in the app as well.
- The `FULLTEXT ... WITH PARSER ngram` index at the bottom of `schema.sql` is **MySQL-only** and commented out.

## Rules of thumb

- Store timestamps in **UTC**; render them in the user's timezone.
- Never store secrets in clear text: argon2id for passwords, SHA-256 digests for session / magic-link / reset tokens, app-side encryption for OAuth tokens.
- Content (MDX docs) stays in git; `doc_pages`, `doc_headings` and `search_documents` are an index rebuilt on deploy.
