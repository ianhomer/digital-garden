const common = `
  --require src/test/features/support/*.js
  --format progress-bar
  --publish-quiet
  `;

module.exports = {
  default: `${common}`,
};

