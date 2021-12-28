const common = `
  --require-module ts-node/register
  --require src/test/cucumber/**/*.ts
  --format summary 
  --format progress-bar
  `;

module.exports = {
  default: `${common}`,
};
