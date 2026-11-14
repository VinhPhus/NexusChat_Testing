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
  reporters: [
    "default",
    ["<rootDir>/backend/node_modules/jest-junit", {
      outputDirectory: "<rootDir>/output/junit",
      outputName: "whitebox-junit.xml",
    }],
  ],
  testMatch: ["<rootDir>/tests/whitebox/**/*.test.js"]
};
