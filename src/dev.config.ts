const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
var webpack = require('webpack');
const webpackConfig = require('../webpack.dev.js');
import { Request, Response, Express } from 'express';
const path = require('path');

interface DotEnvConfig {
  path: string;
}

export const getDevEnvConfigPathObj = (): DotEnvConfig => {
  return { path: 'config/development.env' };
}

export const setupExpressHotUpdateMiddleware = (server: Express): void => {
  const compiler = webpack(webpackConfig);
  server.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: '/static',
    heartbeat: 10 * 1000
  }));

  server.use(webpackHotMiddleware(compiler, {}));

  server.get('/*.hot-update.*', function (req: Request, res: Response) {
    res.redirect('/static' + req.originalUrl);
  });
}

export const getDevStaticFilesPath = (): string => {
  return path.resolve('./src/css');
}

export const getDevIndexFilePath = (): string => {
  return path.join(__dirname, 'index.html');
}
