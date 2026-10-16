# Welcome to Life Planner 👋

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner)

[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=salomaoluiz_life-planner&metric=coverage)](https://sonarcloud.io/summary/new_code?id=salomaoluiz_life-planner)

This project is the Life Planner, a mobile application that helps families organize their lives by managing storage, family schedules, and finances in one place.

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Start the app

   ```bash
    yarn expo start
   ```

## E2E tests (Maestro)

Web E2E flows live in `e2e/` and run only on the owner's Mac, with `yarn web` and the API (`yarn start:dev` in `../life-planner-back`) already running and `E2E_ENABLED=true` in `.env`.

```bash
yarn e2e              # whole suite
yarn e2e --tags auth  # one module
yarn e2e --headless   # no browser window (default shows it)
yarn e2e:smoke        # critical path
yarn e2e:failed       # re-run what failed last time
```

The report is `e2e-report/summary.md`. More in `e2e/README.md`.

## Production

Production runs on the home server, reachable over Tailscale: web at `https://life-planner.example.com`, API at `https://life-planner-api.example.com/api`. It follows `main`: merging and redeploying in Portainer is the release. Server-side steps (database, API stack, Nginx, DNS) are in `docs/production.md` of the backend repo (`life-planner-back`).

### Web stack (Portainer)

Stacks → Add stack → Repository: `https://github.com/salomaoluiz/life-planner`, reference `refs/heads/main`, compose path `docker-compose.web.prod.yml`. Stack environment (inlined into the bundle at build time, so change them and "Pull and redeploy"):

| Variable                                                                         | Value                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL`                                                            | `https://life-planner-api.example.com/api`              |
| `EXPO_PUBLIC_PROJECT_WEBSITE_URL`                                                | `https://life-planner.example.com`                      |
| `EXPO_PUBLIC_SENTRY_ENVIRONMENT` / `EXPO_PUBLIC_SENTRY_ENABLED`                  | `production` / `true`                                        |
| `EXPO_PUBLIC_SENTRY_ORGANIZATION`, `_PROJECT`, `_DSN`, `_URL`, `_TRACES_SAMPLER` | same Sentry project as development (values from your `.env`) |

The image is built on the server (Expo web export, `Dockerfile.web`, served by nginx on host port `1016`). The export needs more memory than the container limit, which only applies to the running container. No Supabase variables are needed. After deploying, `scripts/web/test-nginx.sh` is the local check for the nginx rules (SPA fallback, 404 for missing assets, cache headers).

### Android APK (local, sideload)

One app id for every build (`com.jacobysoftware.lifeplanner`); installing the production APK over a staging build is fine as long as it is signed with the same key.

1. Create the release keystore once and **back it up outside this machine** (every update must use the same one):

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore ~/keystores/life-planner-release.jks \
     -alias life-planner -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add to `~/.gradle/gradle.properties` (never in the repo):

   ```properties
   LP_RELEASE_STORE_FILE=/Users/<you>/keystores/life-planner-release.jks
   LP_RELEASE_STORE_PASSWORD=...
   LP_RELEASE_KEY_ALIAS=life-planner
   LP_RELEASE_KEY_PASSWORD=...
   ```

3. Create `.env.production` (git-ignored) from `.env.example` with the production values, at least `EXPO_PUBLIC_API_URL=https://life-planner-api.example.com/api`.
4. Run `yarn build:android:prod`. It refuses to run without `.env.production`, with a non-https or local API URL, or without the keystore properties. It runs `expo prebuild --clean` (this regenerates the git-ignored `android/` folder) and `./gradlew assembleRelease`, and prints the APK path (`android/app/build/outputs/apk/release/app-release.apk`).
5. Install it by hand (`adb install -r <apk>` or copy it to the phone). If Android reports a signature mismatch, uninstall the old build first.

iOS is not covered; use the web app on the iPhone.

### Release flow

Merge to `main` → "Pull and redeploy" the affected Portainer stack (API and web together when the API contract changes) → build a new APK only when the app itself changed. Keep `main` deployable: PRs merge green and migrations are additive.

## Contributing

You can find the contributing guidelines in the [CONTRIBUTING.md](https://github.com/salomaoluiz/life-planner/blob/main/CONTRIBUTING.md) file.

## Folder Structure

In the project, you will find the following folders:

- `app`: Contains only the routes and navigation of the application.
- `assets`: Contains the images and fonts used in the application.
- `src`: It is the main folder of the application, where the is structured using the clean architecture.
  - `application`: Contains the use cases of the application.
  - `domain`: Contains the entities and interfaces of the application.
  - `infrastructure`: Contains the implementation of the interfaces.
  - `presentation`: Contains the screens and components of the application.
    - `screens`: Contains the screens of the application.
    - `components`: Contains the generic components used across the application.
    - `styles`: Contains the global styles of the application.
    - `utils`: Contains the utility functions of the presentation layer.
