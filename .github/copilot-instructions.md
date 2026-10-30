Read docs/ai/INDEX.md before any task.

- User-visible changes must ship with an E2E flow in `e2e/flows/<module>/` and the full suite (`yarn e2e`) must pass; see `.claude/CLAUDE.md` rule 12.

## Version and changelog guardrail

A PR touching shipped paths (`src/`, `app/`, `assets/`, `plugins/`, `app.config.ts`, `Dockerfile.web`, `nginx.web.conf`, `docker-compose.web.prod.yml`, dependencies, `yarn.lock`) must bump `package.json` `version` exactly one step (breaking → major, `feat` → minor, else patch) and add the matching top `CHANGELOG.md` entry; docs/tests/e2e/CI-only PRs must not bump (`yarn version:check`).
