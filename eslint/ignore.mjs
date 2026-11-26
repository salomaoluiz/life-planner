export default {
  ignores: [
    "app-example/*",
    "node_modules/*",
    "./expo-env.d.ts",
    "**/*.snap",
    ".env*",
    ".gitignore",
    "yarn.lock",
    "tsconfig.json",
    ".lintstagedrc.json",
    "dist/*",
    "android/*",
    "ios/*",
    "coverage/*",
    ".expo/*",
    "metro.config.js",
    "jest.config.js",
    "plugins/*.js",
    // The Web Push service worker runs in a worker scope, outside the app project (spec 124).
    "public/sw.js",
    "eslint.config.mjs",
    "eslint/**/*",
    "e2e/scripts/**/*",
    ".claude/worktrees/**",
    // Design artboards and plans (git-ignored, spec 110) hold exported JS that is not source.
    "docs/**",
  ],
};
