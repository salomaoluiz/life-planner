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
