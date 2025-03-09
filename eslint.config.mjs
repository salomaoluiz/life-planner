import globals from "globals";
import pluginJs from "@eslint/js";
import { configs as tsEslintConfig } from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginImportX from "eslint-plugin-import-x";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslintConfig.recommended,
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
    },
  },
];
