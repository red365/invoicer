var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractCSS = new ExtractTextPlugin({ filename: 'css.bundle.css' })
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/index'
  ],
  output: {
    path: path.resolve( __dirname, 'dist/static'),
    filename: "bundle.js",
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), 
    new BundleTracker({filename: './webpack-stats.json'}),
    extractCSS,
  ],
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['react-hot-loader/webpack', 'babel-loader']
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]',
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer()
              ]
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(|jpg|jpeg|png|svg)$/,
        loader: 'url-loader',
        options: {
          name: 'img/[hash].[ext]',
          publicPath: '/',
          limit: 25000,
        },
      },
    ]
  },

  resolve: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx']
  }
}
