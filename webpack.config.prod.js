const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: false
});

const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    main: [
      './src/ts/main.ts'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'amd'
  },
  module: {
    loaders:[
    {
      test: /\.json$/,
      loader: 'json-loader'
    }
    ],
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
          loader: "file-loader",
          options: {
            outputPath: 'fonts/'
            // useRelativePath: true
          }
        },
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{
              loader: "css-loader"
          }, {
              loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
      })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: "url-loader",
        options: {
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
    extractSass,
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/ts/sw.ts'),
      filename: '../sw.js',
      publicPath: '/hiking-app/dist/'
    }),
    new UglifyJsPlugin()

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

