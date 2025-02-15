# Welcome to Life Planner 👋

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
