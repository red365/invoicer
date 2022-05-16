import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import config from '../webpack.dev.js';
import path from 'path';

export function getDevEnvConfigPathObj() {
  return { path: 'config/development.env' };
}

export function setupExpressHotUpdateMiddleware(server) {
  const compiler = webpack( config );
  server.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: '/static',
    heartbeat: 10 * 1000
  }));

  server.use(webpackHotMiddleware(compiler, {}));

  server.get('/*.hot-update.*', function(req, res) {
    res.redirect('/static' + req.originalUrl);
  });
}

export function getDevStaticFilesPath() {
    return path.resolve('./src/css');
}

export function getDevIndexFilePath() {
  return path.join(__dirname, 'index.html' );
}
