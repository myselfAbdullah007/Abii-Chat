module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove source-map-loader rules for node_modules to avoid noisy warnings
      if (webpackConfig.module && Array.isArray(webpackConfig.module.rules)) {
        webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
          if (rule && typeof rule === 'object' && Array.isArray(rule.oneOf)) {
            rule.oneOf = rule.oneOf.map((one) => {
              if (
                one &&
                one.loader &&
                one.loader.includes('source-map-loader')
              ) {
                one.exclude = /node_modules/;
              }
              return one;
            });
          }
          return rule;
        });
      }

      // Suppress specific warnings from @firebase/auth source maps
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        (warning) =>
          typeof warning.message === 'string' &&
          warning.message.includes('@firebase/auth') &&
          warning.message.includes('Failed to parse source map'),
      ];

      return webpackConfig;
    },
  },
}; 