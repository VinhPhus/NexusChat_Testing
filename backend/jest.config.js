export default {
  rootDir: "../",
  testEnvironment: "node",
  transform: {},
  moduleDirectories: ["node_modules", "<rootDir>/backend/node_modules"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverageFrom: [
    "backend/src/**/*.js",
    "!backend/src/libs/**",
    "!backend/src/utils/seedNexusAI.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["<rootDir>/tests/whitebox/**/*.test.js"]
};
