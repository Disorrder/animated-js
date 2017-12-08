'use strict';
const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: path.resolve('./src'),
    entry: './index.js',
    output: {
        path: path.resolve('./dist'),
        filename: "animated.js"
    }
};
