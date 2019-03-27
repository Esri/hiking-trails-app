const webpack = require('webpack');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
  entry: {
    main: [
      './src/ts/main.ts',
      './src/style/main.scss',
    ]
  },
  output: {
    filename: '[name].bundle.js',
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'awesome-typescript-loader'
        }
      },
      {
        // Capture eot, ttf, woff, and woff2
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "file-loader"
        },
      },
      {
        test: /\.scss$/,
        use: [{
          loader: "style-loader"
        }, {
            loader: "css-loader"
        }, {
            loader: "sass-loader"
        }],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          { loader: "url-loader" }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.scss']
  },
  devtool: 'eval-source-map',
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/ts/sw.ts'),
      filename: '../sw.js',
      publicPath: '/hiking-app/dist/'
    }),
    new TSLintPlugin({
      files: ['./src/ts/**/*.ts']
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
    /* new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }) */
  ],
  devServer: {
    contentBase: __dirname
  },
  externals: [
    function (context, request, callback) {
      // exclude any esri or dojo modules from the bundle
      // these are included in the ArcGIS API for JavaScript
      // and its Dojo loader will pull them from its own build output
      if (/^dojo/.test(request) ||
        /^dojox/.test(request) ||
        /^dijit/.test(request) ||
        /^esri/.test(request)
      ) {
        return callback(null, 'amd ' + request);
      }
      callback();
    }
  ]
}
