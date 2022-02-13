const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testPathIgnorePatterns: ["./test/e2e"],
};

module.exports = createJestConfig(customJestConfig);
