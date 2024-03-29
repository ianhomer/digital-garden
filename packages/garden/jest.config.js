const transformIgnores = [
  ".*bail",
  ".*character-entities",
  ".*compromise",
  ".*decode-named-character-reference",
  ".*devlop",
  ".*efrt",
  ".*grad-school",
  ".*is-plain-obj",
  ".*mdast.*",
  ".*micromark.*",
  ".*remark-parse",
  ".*suffix-thumb",
  ".*trough",
  ".*unified",
  ".*unist",
  ".*vfile",
].join("|");
const config = {
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/*.test.ts"],
  transformIgnorePatterns: [`/node_modules/(?!${transformIgnores})`],
};

export default config;
