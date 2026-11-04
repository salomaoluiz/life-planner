const preventAbsoluteImports = {
  rules: {
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
};

const preventInfrastructureLibsImports = {
  files: ["**/*.{js,ts,tsx,jsx}"],
  ignores: ["src/infrastructure/**/*"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        message: "Please, use `@infrastructure/monitoring` instead",
        name: "@sentry/react-native",
      },
      {
        message: "Please, use `@infrastructure/fetcher` instead",
        name: "@tanstack/react-query",
      },
      {
        message: "Please, use `@infrastructure/googleOAuth` instead",
        name: "@react-native-google-signin/google-signin",
      },
      {
        message: "Please, use `@infrastructure/storage` instead",
        name: "@react-native-async-storage/async-storage",
      },
      {
        message: "Please, use `@infrastructure/csv` instead",
        name: "papaparse",
      },
      {
        message: "Please, use `@infrastructure/filePicker` instead",
        name: "expo-document-picker",
      },
      {
        message: "Please, use `@infrastructure/fileSave` instead",
        name: "expo-sharing",
      },
      {
        message: "Please, use `@infrastructure/supabase` instead",
        name: "@supabase/supabase-js",
      },
    ],
  },
};

const preventPresentationLibsImports = {
  files: ["**/*.{js,ts,tsx,jsx}"],
  ignores: ["src/presentation/i18n/react-i18n/**/*"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        message: "Please, use `@presentation/i18n` instead",
        name: "react-i18next",
      },
      {
        message:
          "Import the function from `lodash/<name>`: the root import pulls the whole library into the web bundle (spec 088)",
        name: "lodash",
      },
    ],
  },
};

// Spec 088: a namespace import of date-fns defeats tree shaking.
export const bundleSyntaxSelectors = [
  {
    message:
      "Use named imports from `date-fns`: `import * as` pulls the whole library into the web bundle (spec 088)",
    selector:
      "ImportDeclaration[source.value='date-fns'] > ImportNamespaceSpecifier",
  },
];

const preventBundleHeavyImports = {
  files: ["**/*.{js,ts,tsx,jsx}"],
  rules: { "no-restricted-syntax": ["error", ...bundleSyntaxSelectors] },
};

export default [
  preventBundleHeavyImports,
  preventAbsoluteImports,
  preventInfrastructureLibsImports,
  preventPresentationLibsImports,
];

export const restrictedPatterns =
  preventAbsoluteImports.rules["no-restricted-imports"][1].patterns;
export const restrictedPaths = [
  ...preventInfrastructureLibsImports.rules["no-restricted-imports"].slice(1),
  ...preventPresentationLibsImports.rules["no-restricted-imports"].slice(1),
];
