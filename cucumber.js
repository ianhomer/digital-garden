const common = `
   src/test/features/**/*.feature
  --require src/test/features/**/*.ts
  --format progress-bar
  --publish-quiet
  `;

require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
  },
});

module.exports = {
  default: `${common}`,
};
