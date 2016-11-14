var WebpackOnBuildPlugin = require('on-build-webpack');
var execSync = require('child_process').execSync;
var path = require('path');

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    output: {
        filename: './build/ty3status.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.ts', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new WebpackOnBuildPlugin(function ()
        {
            execSync("npm run bin");
        })
    ],
    devtool: 'inline-source-map'
};
