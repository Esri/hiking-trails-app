var webpack = require('webpack');

module.exports = {
  entry: {
    main: [
      './src/ts/main.ts'
    ]
  },
  output: {
    filename: './dist/[name].bundle.js',
    libraryTarget: 'amd'
  },
  module: {
    loaders:[
    {
      test: /\.json$/,
      loader: 'json-loader'
    },
    { test: /\.(woff|woff2|eot|ttf)$/,
      loader: 'url-loader?limit=100000'
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
          loader: "file-loader"
        },
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
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
    extensions: ['.ts', '.js', '.json']
  },
  devtool: 'eval-source-map',
  /* plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    })
  ], */
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

