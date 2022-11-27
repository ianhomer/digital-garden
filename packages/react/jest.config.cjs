const config = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^d3$": "<rootDir>/node_modules/d3/dist/d3.min.js",
    "^d3-quadtree$":
      "<rootDir>/node_modules/d3-quadtree/dist/d3-quadtree.min.js",
  },
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

module.exports = config;
