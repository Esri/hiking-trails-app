const webpack = require('webpack');
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require('path');

module.exports = {
  entry: {
    main: [
      './src/ts/main.ts'
    ]
  },
  output: {
    filename: '[name].[chunkhash].js',
    /* path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js', */
    libraryTarget: 'amd'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      })
    ]
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
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "resolve-url-loader",
            options: { includeRoot: true }
          },
          "sass-loader?sourceMap"
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: "url-loader",
        options: {
          // Inline files smaller than 10 kB (10240 bytes)
          limit: 10 * 1024
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: "image-webpack-loader",
        enforce: "pre"
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*']),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/ts/sw.ts'),
      filename: 'sw.js',
      publicPath: '/hiking-trails-app/'
    }),
    new TSLintPlugin({
      files: ['./src/ts/**/*.ts']
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css",
      chunkFilename: "[id].css"
    }),
    new UglifyJsPlugin(),
    new HtmlWebPackPlugin({
      title: "Hiking trails",
      template: "./index.html",
      inject: false
    }),
    new CopyWebpackPlugin([
      { from: 'src/img',  to: 'src/img', force: true },
    ]),
    new WebpackPwaManifest({
      filename: "manifest.json",
      name: "Hiking app Swiss National Park",
      short_name: "Hiking app",
      description: "Hiking app",
      background_color: "#2d2b07",
      theme_color: "#b5e2c1",
      start_url: "index.html",
      orientation: "omit",
      icons: [
        {
          src: path.resolve("src/img/android-icon-512x512.png"),
          sizes: [36, 48, 72, 96, 144, 192, 512]
        }
      ]
    })
    /* new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }) */
  ],
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
