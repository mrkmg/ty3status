var WebpackOnBuildPlugin = require('on-build-webpack');
var execSync = require('child_process').execSync;

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    mode: "production",
    output: {
        filename: 'ty3status.js',
        path: __dirname + "/build"
    },
    resolve: {
        extensions: ['.webpack.js', '.ts', '.js']
    },
    module: {
        rules: [
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
    ]
};
