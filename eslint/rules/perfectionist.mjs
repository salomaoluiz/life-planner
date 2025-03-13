import perfectionist from "eslint-plugin-perfectionist";

const internalModules = [
  "@assets",
  "@screens",
  "@components",
  "@presentation",
  "@domain",
  "@application",
  "@infrastructure",
  "@data",
  "@navigation",
  "@utils",
  "@providers",
];

export default {
  ...perfectionist.configs["recommended-natural"],
  rules: {
    ...perfectionist.configs["recommended-natural"].rules,
    "perfectionist/sort-exports": [
      "error",
      {
        fallbackSort: { order: "asc", type: "line-length" },
        groupKind: "types-first",
        ignoreCase: true,
        order: "asc",
        partitionByComment: false,
        partitionByNewLine: false,
        specialCharacters: "keep",
        type: "alphabetical",
      },
    ],
    "perfectionist/sort-imports": [
      "error",
      {
        customGroups: {
          type: {
            internal: internalModules.map((module) => `^${module}`),
          },
          value: {
            test: "@tests",
            internal: internalModules.map((module) => `^${module}`),
          },
        },
        fallbackSort: { order: "asc", type: "line-length" },
        groups: [
          ["builtin", "external", "builtin-type", "external-type"],
          ["test"],
          ["internal", "internal-type"],
          [
            "parent",
            "sibling",
            "index",
            "sibling-type",
            "parent-type",
            "index-type",
          ],
        ],
        ignoreCase: true,
        newlinesBetween: "always",
        order: "asc",
        specialCharacters: "keep",
        type: "alphabetical",
      },
    ],
  },
};
