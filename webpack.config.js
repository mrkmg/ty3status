module.exports = {
    entry: './src/main.ts',
    target: 'node',
    output: {
        filename: './build/ty3bar.js'
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
    devtool: 'inline-source-map'
};
