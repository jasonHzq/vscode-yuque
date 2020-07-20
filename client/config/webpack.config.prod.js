const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const CircularDependencyPlugin = require('circular-dependency-plugin');
// const I18nBundleWebpackPlugin = require('@alife/i18n-bundle-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const signale = require('signale');

// check node version
// const semver = require('semver');
// const chalk = require('chalk');
// const nodeVersion = process.version;

// if (semver.lt(nodeVersion, '8.1.0')) {
//   console.log(chalk.red(`Please upgrade node to 8.1, your are using ${nodeVersion}.`));
//   process.exit(0);
// }

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "../src/app.tsx"),
  },
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    globalObject: "this",
  },

  devtool: "cheap-eval-module-source-map",
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, "../src")],
        use: [
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true,
              transpileOnly: true,
              reportFiles: ["!src/scripts/**", "./src/**/*.{ts,tsx}"],
              configFile: path.resolve(__dirname, "../tsconfig.json"),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: [
          path.join(__dirname, "../src/"),
          path.join(__dirname, "../node_modules"),
        ],
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          "css-loader?sourceMap",
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
        use: ["url-loader?limit=100000"],
      },
    ],
  },

  optimization: {
    minimize: true,

    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules\/(react|react-dom|@ali)/g,
          chunks: "initial",
          name: "vendor",
          enforce: true,
          priority: 2,
        },
      },
    },
  },

  devServer: {
    // https: true,
    contentBase: path.join(__dirname, "../"),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    historyApiFallback: {
      disableDotRule: true,
    },
    stats: {
      assets: true,
      chunks: false,
      cached: false,
      cachedAssets: false,
      children: false,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      modules: false,
      timing: true,
    },
    host: "127.0.0.1",
    port: 6000,
    inline: true,
    compress: true,
    hot: true,
    hotOnly: true,
    disableHostCheck: true,
  },
  resolve: {
    alias: {},
    extensions: [".ts", ".tsx", ".js", ".json", ".scss", ".css"],
    symlinks: false,
  },

  performance: {
    hints: false,
  },

  plugins: [
    // 使用css文件方式加载，坑见：https://yuque.antfin-inc.com/lingyi.zcs/srffw2/onfeky
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    // 此plugin的路径是相对路径不适合判断，当前采用importPermitLoader.js替代
    // new webpack.IgnorePlugin({
    //   checkResource(resource) {
    //     // resource的格式如：../locale-provider/LocaleReceiver
    //     // 禁止引用ng中的js代码（非代码文件暂时豁免）
    //     if (/\/ng\/.+?/.test(resource)) {
    //       signale.error(`当前引用了ng目录代码"${resource}"，此行为被禁止（若确实需要，请抽离到外层，切断依赖）`);
    //       return true;
    //     }

    //     return false;
    //   }
    // }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb|zh-cn/),
    new webpack.WatchIgnorePlugin([/\.js$/]),
  ],
};
