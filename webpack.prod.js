var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const extractCSS = new ExtractTextPlugin({ filename: 'css.bundle.css' })
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    './src/index.tsx'
  ],
  output: {
    path: path.resolve( __dirname, 'dist/static'),
    filename: "bundle.js",
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.UglifyJsPlugin(), 
    new BundleTracker({filename: './webpack-stats.json'}),
    new ExtractTextPlugin('[name].css'),
    new CleanWebpackPlugin('./dist/static/*'),
    // The value of 'to' is relative to the bundle path defined in output.path
    new CopyWebpackPlugin([ 
      { from: './src/index.html', to: '../' }, 
      // { from: './src/css/main.css', to: './' } 
    ])
  ],
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['react-hot-loader/webpack', 'babel-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            use: [
              { loader: 'css-loader', options: { minimize: true } }
            ],
            // use this, if CSS isn't extracted
            fallback: 'style-loader'
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            use: [
                { loader: 'css-loader', options: { minimize: true } }, 
                'resolve-url-loader',
                'sass-loader',
            ],
            fallback: 'style-loader'
        }),
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
    extensions: ['.tsx', '.js', '.jsx']
  }
}
