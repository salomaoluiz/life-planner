import globals from "globals";
import pluginJs from "@eslint/js";
import { configs as tsEslintConfig } from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginImportX from "eslint-plugin-import-x";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslintConfig.recommended,
  ...pluginQuery.configs["flat/recommended"],
  eslintPluginPrettierRecommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
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
    ],
  },
  {
    settings: {
      "import-x/parser": {
        "@typescript-eslint/parser": ["**/*.{ts,tsx}"],
      },
      "import-x/resolver": {
        typescript: true,
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "no-console": "error",
      "import-x/no-cycle": [
        "error",
        {
          maxDepth: 3,
        },
      ],
      "func-style": ["warn", "declaration"],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*", "../../"],
              message: "Please use absolute imports",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,ts,tsx,jsx}"],
    ignores: ["src/infrastructure/**/*", "src/presentation/i18n/react-18n"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@sentry/react-native",
                "@tanstack/react-query",
                "@react-native-google-signin/google-signin",
                "@react-native-async-storage/async-storage",
                "@supabase/supabase-js",
              ],
              message:
                "This library is in the infrastructure folder, please import it from there.",
            },
            {
              group: ["react-i18next"],
              message:
                "This library is in the presentation folder, please import it from there.",
            },
          ],
        },
      ],
    },
  },
];
