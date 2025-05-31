/* eslint-disable no-undef */

module.exports = {
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/mocks/**/*.stories.tsx",
    "!**/*.fixture.ts",
    "!**/*.fixture.tsx",
    "!**/*.mocks.tsx",
    "!**/*.mocks.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/tests/svgMock.ts",
  },
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.tsx",
    "<rootDir>/tests/mockReactNativePaper.tsx",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/tests/"],
  transformIgnorePatterns: ["jest-runner"],
};
