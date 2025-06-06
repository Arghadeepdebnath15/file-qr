class IgnoreSourceMapWarningsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('IgnoreSourceMapWarningsPlugin', stats => {
      if (stats.compilation.warnings) {
        stats.compilation.warnings = stats.compilation.warnings.filter(warning => {
          if (warning.message) {
            return !warning.message.includes('react-datepicker') && 
                   !warning.message.includes('Failed to parse source map');
          }
          return true;
        });
      }
    });
  }
}

module.exports = IgnoreSourceMapWarningsPlugin; 