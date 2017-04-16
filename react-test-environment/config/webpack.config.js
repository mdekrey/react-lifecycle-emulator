var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?/',
    'index.tsx'
  ],
  output: {
    filename: 'app.js',
    publicPath: '/dist',
    path: path.resolve('dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['src', 'node_modules'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ['awesome-typescript-loader'] }
    ]
  },
  plugins: [
  ],
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: 'empty',
    net: 'empty'
  }
};
