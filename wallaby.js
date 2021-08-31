module.exports = function() {
  return {
    autoDetect: true,
    testFramework: {
      configFile: './jest.config.wallaby.js',
    },
    hints: {
      ignoreCoverage: /src\/typings.ts/,
    },
    debug: true,
  };
};
