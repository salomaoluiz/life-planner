# Contributing to Life Planner

Thank you for your interest in contributing to **Life Planner**! This project aims to help families organize their lives by managing storage, family schedules, and finances in one place. We welcome contributions from the community to improve and expand the application.

## How to Contribute

### 1. Fork and Clone the Repository
1. Fork this repository to your GitHub account.
2. Clone your fork to your local machine:
   ```sh
   git clone https://github.com/salomaoluiz/life-planner.git
   ```
3. Navigate to the project directory:
   ```sh
   cd life-planner
   ```
4. Add the upstream repository:
   ```sh
   git remote add upstream https://github.com/salomaoluiz/life-planner.git
   ```

### 2. Set Up the Development Environment
- Ensure you have **Node.js** and **Yarn** installed.
- Install dependencies:
  ```sh
  yarn install
  ```
- Run the development server:
  ```sh
  yarn expo start --web
  yarn expo start --android
  yarn expo start --ios
  ```

### 3. Follow the Code Standards
- **Frontend:** React Native with Expo
- Follow the existing **folder structure** and **coding guidelines**.
- Ensure your code follows the **ESLint and Prettier** formatting rules:
  ```sh
  yarn lint
  yarn format
  ```

### 4. Making Changes and Creating a Pull Request
1. Create a new branch:
   ```sh
   git checkout -b feature/your-feature
   ```
2. If you are creating from an issue, use the issue number as code to branch, e.g., `LP-123`.
   ```sh
   git checkout -b feature/LP-123
   ```
3. Make your changes and commit them:
   ```sh
   git add .
   git commit -m "chore: Add your feature description"
   ```
   > OBS: Always use the semantic commit message pattern. [Learn more](https://www.conventionalcommits.org/en/v1.0.0/).
4. Pull the latest changes from the original repository:
   ```sh
   git pull upstream main
   ```
   > OBS: If you have conflicts, resolve them before pushing your changes.
5. Push the branch to your fork:
   ```sh
   git push origin feature/your-feature
   ```
6. Open a Pull Request (PR) to the `main` branch of the original repository.
7. Provide a **clear description** of the changes and mention any related issues.
8. Wait for review and address any requested changes.

### 5. Reporting Issues
If you find a bug, have a feature request, or need support:
- **Check existing issues** to avoid duplicates.
- Open a new issue with a **clear title** and **detailed description**.
- If applicable, provide **steps to reproduce** and **expected behavior**.

## Contribution Guidelines
✅ **Write clean, readable, and maintainable code**.

✅ **Document your changes** where necessary.

✅ **Ensure all tests pass** before submitting a PR.

✅ **Be respectful and constructive** in discussions.

✅ **Follow semantic commit messages**, e.g., `feat: add new task management feature`.

## Getting Help
For any questions, feel free to open an issue or reach out to the maintainers.

Happy coding! 🚀
