const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

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
  ".*vfile"
].join("|");
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["./test/e2e"],
  testEnvironment: "jest-environment-jsdom",
  // transform: {
  //   "node_modules/.*/remark-parse/.+\\.(j|t)sx?$": [
  //     "babel-jest",
  //     { presets: ["next/babel"] },
  //   ],
  // },
  transformIgnorePatterns: [`/node_modules/(?!${transformIgnores})`],
};

const asyncConfig = createJestConfig(customJestConfig);

module.exports = async () => {
  const config = await asyncConfig();
  config.transformIgnorePatterns = customJestConfig.transformIgnorePatterns;
  return config;
};
