# Database (Supabase / Postgres) — LEGACY

> Supabase is the legacy backend and is being migrated to the new local backend (`../life-planner-back`, Prisma schema in `prisma/schema.prisma`). Prefer adding new tables/columns there (see `.claude/context/backend.md`); only change these SQL docs for fixes to modules not yet migrated, or when the user asks.

SQL lives as ordered markdown docs in `docs/database/` — read only the file you need:

| File                                                      | Contents                                                |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `1. create_tables.md`                                     | `CREATE TABLE` for all tables                           |
| `2. create_polices.md`                                    | RLS policies (owner/family-member based) — largest file |
| `4. family_members_trigger.md` / `5. families_trigger.md` | family membership triggers                              |
| `7. validate_owner_trigger.md`                            | `validate_owner()` trigger attached per owned table     |

## Tables

`users`, `families`, `family_members`.

## Conventions

- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at timestamptz NOT NULL DEFAULT now()`, snake_case columns.
- Owned rows: `owner text NOT NULL` (`'USER' | 'FAMILY'`) + `owner_id uuid NOT NULL`; add a `trg_validate_owner_<table>` trigger (file 7) and RLS policies (file 2).
- `COMMENT ON TABLE ... IS '...'` after each table.
- Changing a column → update: the SQL doc, the Model `fromJSON`/`toJSON`, datasource payloads, the Entity/DTO, and tests.

Financial data lives in the NestJS API database (spec 006); its Supabase tables/policies/triggers were removed from these docs.
