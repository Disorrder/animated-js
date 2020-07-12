'use strict';
const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = {
    context: path.resolve('./src'),
    entry: './index.js',
    output: {
        path: path.resolve('./dist'),
        filename: "timeline.js",
        library: "timeline",
        libraryTarget: "umd",
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(pkg.version),
        })
    ]
};
