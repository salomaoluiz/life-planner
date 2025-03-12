import pluginJs from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import { configs as tsEslintConfig } from "typescript-eslint";

import ignoreFiles from "./eslint/ignore.mjs";
import eslintBaseRule from "./eslint/rules/eslint-base.mjs";
import importXRule from "./eslint/rules/import-x.mjs";
import noRestrictedImportsRule from "./eslint/rules/no-restricted-imports.mjs";
import perfectionistRule from "./eslint/rules/perfectionist.mjs";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslintConfig.recommended,
  ...pluginQuery.configs["flat/recommended"],
  eslintPluginPrettierRecommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  ignoreFiles,
  importXRule,
  eslintBaseRule,
  ...noRestrictedImportsRule,
  perfectionistRule,
];
