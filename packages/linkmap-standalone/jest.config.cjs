const config = {
  testEnvironment: "jsdom",
  globals: {
    TextEncoder: require("util").TextEncoder,
    TextDecoder: require("util").TextDecoder,
  },
};

module.exports = config;
