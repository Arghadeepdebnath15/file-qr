const path = require('path');
const webpack = require('webpack');
const IgnoreSourceMapWarningsPlugin = require('./webpack-ignore-warnings-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source maps completely for node_modules
      if (webpackConfig.devtool) {
        webpackConfig.devtool = false;
      }

      // Add ignore plugin for react-datepicker source maps
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/.*\.tsx$/,
          contextRegExp: /react-datepicker\/src$/
        }),
        new IgnoreSourceMapWarningsPlugin()
      );

      // Filter out source-map-loader for node_modules
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        if (rule.enforce === 'pre' && rule.use) {
          return !rule.use.some(loader => 
            (typeof loader === 'string' && loader.includes('source-map-loader')) ||
            (typeof loader === 'object' && loader.loader && loader.loader.includes('source-map-loader'))
          );
        }
        return true;
      });

      return webpackConfig;
    },
  },
};