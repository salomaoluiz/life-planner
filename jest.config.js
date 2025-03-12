/* eslint-disable no-undef */

module.exports = {
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
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/tests/svgMock.ts",
  },
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/"],
  transformIgnorePatterns: ["jest-runner"],
};
