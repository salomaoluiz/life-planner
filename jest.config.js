/* eslint-disable no-undef */

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.tsx"],
  transformIgnorePatterns: ["jest-runner"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/tests/svgMock.ts",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}", // Specify which files to collect coverage from
    "!src/**/*.d.ts", // Exclude TypeScript declaration files
    "!src/**/mocks/**/*.stories.tsx", // Exclude storybook stories
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
