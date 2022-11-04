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
  collectCoverage: true,
  coverageDirectory: "output",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  reporters: ["default", ["jest-html-reporters", { publicPath: "output" }]],
  testPathIgnorePatterns: ["./test/e2e"],
  testEnvironment: "jest-environment-jsdom",
  transformIgnorePatterns: [`/node_modules/(?!${transformIgnores})`],
};

module.exports = config;
