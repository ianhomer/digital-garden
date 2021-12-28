const common = `
  --require-module ts-node/register
  --require src/**/*.ts
  --format summary 
  --format progress-bar
  `;

module.exports = {
  default: `${common}`,
};
