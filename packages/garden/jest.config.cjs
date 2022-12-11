const transformIgnores = [
  ".*remark-parse",
  ".*mdast.*",
  ".*micromark.*",
  ".*decode-named-character-reference",
  ".*character-entities",
  ".*unist",
  ".*unified",
  ".*bail",
  ".*is-plain-obj",
  ".*trough",
  ".*vfile",
  ".*compromise",
  ".*grad-school",
  ".*efrt",
  ".*suffix-thumb",
].join("|");
const config = {
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/*.test.ts"],
  transformIgnorePatterns: [`/node_modules/(?!${transformIgnores})`],
};

module.exports = config;
