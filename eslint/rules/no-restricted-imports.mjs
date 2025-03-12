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
    ],
  },
};

export default [
  preventAbsoluteImports,
  preventInfrastructureLibsImports,
  preventPresentationLibsImports,
];
