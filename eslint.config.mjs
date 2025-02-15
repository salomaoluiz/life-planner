import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintPluginPrettierRecommended,
  { ignores: ["app-example/*", "node_modules/*"] },
];
