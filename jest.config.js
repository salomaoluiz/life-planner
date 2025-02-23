/* eslint-disable no-undef */

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.tsx"],
  transformIgnorePatterns: ["jest-runner"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/"],
  moduleDirectories: ["node_modules", "src"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
