module.exports = {
    entry: './src/main.ts',
    target: 'node',
    mode: "production",
    devtool: 'eval',
    output: {
        clean: true,
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
    }
};
