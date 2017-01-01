const fs = require('fs-extra');
const webpack = require('webpack');
const log = require('log')('app:bin:compile');
const webpackConfig = require('build/webpack.config');

const config = require('build/config');
const paths = config.utils_paths;

// Wrapper around webpack to promisify its compiler and supply friendly logging
const webpackCompiler = (webpackConfig) =>
  new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    compiler.run((err, stats) => {
      if (err) {
        log('Webpack compiler encountered a fatal error.', err);
        return reject(err);
      }

      const jsonStats = stats.toJson();
      log('Webpack compile completed.');
      log(stats.toString(config.compiler_stats));

      if (jsonStats.errors.length > 0) {
        log.error('Webpack compiler encountered errors.');
        log.error(jsonStats.errors.join('\n'));
        return reject(new Error('Webpack compiler encountered errors'));
      } else if (jsonStats.warnings.length > 0) {
        log('Webpack compiler encountered warnings.');
        log(jsonStats.warnings.join('\n'));
      } else {
        log('No errors or warnings encountered.');
      }
      resolve(jsonStats);
    });
  });

const compile = () => {
  log('Starting compiler.');
  return Promise.resolve()
    .then(() => webpackCompiler(webpackConfig))
    .then(stats => {
      if (stats.warnings.length && config.compiler_fail_on_warning) {
        throw new Error('Config set to fail on warning, exiting with status code "1".');
      }
      log('Copying static assets to dist folder.');
      fs.copySync(paths.public(), paths.dist());
    })
    .then(() => {
      log('Compilation completed successfully.');
    })
    .catch((err) => {
      log('Compiler encountered an error.', err);
      process.exit(1);
    });
};

compile();
