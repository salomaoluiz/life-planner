// This file is used to configure the import-x plugin.

export default {
  rules: {
    // This rule is used to prevent circular dependencies.
    "import-x/no-cycle": [
      "error",
      {
        maxDepth: 3,
      },
    ],
  },
  settings: {
    "import-x/parser": {
      "@typescript-eslint/parser": ["**/*.{ts,tsx}"],
    },
    "import-x/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      typescript: true,
    },
  },
};
