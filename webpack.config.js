const webpack = require('webpack');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const configUtils = require('./config/utils.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    client: {
        entry: config.client.entry(),
        output: config.client.output(),
        resolve: {
            extensions: ['.js', '.json', '.html'],
            mainFields: ['svelte', 'module', 'browser', 'main'],
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: configUtils.babel,
                        },
                        {
                            loader: 'svelte-loader',
                            options: {
                                emitCss: true, // pass CSS to webpack
                                hydratable: true,
                                hotReload: dev,
                                dev: dev,
                                preserveComments: dev,
                                preprocess: {
                                    style: configUtils.sass,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        dev
                            ? {
                                  // CSS HMR
                                  loader: 'style-loader',
                                  options: { sourceMap: true },
                              }
                            : // extract CSS in production builds
                              MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { sourceMap: dev } },
                        // {
                        //     loader: 'postcss-loader',
                        //     options: { sourceMap: dev },
                        // },
                    ],
                },
                {
                    test: /\.(js|jsx)$/,
                    enforce: 'post',
                    exclude: [
                        /node_modules\/babel-/m,
                        /node_modules\/core-js\//m,
                        /node_modules\/regenerator-runtime\//m,
                        /node_modules\/@?babel/,
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: configUtils.babel,
                    },
                },
            ],
        },
        mode,
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[hash]/[name].css',
                chunkFilename: '[hash]/[name].[id].css',
            }),
            dev && new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                'process.browser': true,
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
        ].filter(Boolean),
        devtool: dev && 'inline-source-map',
    },

    server: {
        entry: config.server.entry(),
        output: config.server.output(),
        target: 'node',
        resolve: {
            extensions: ['.js', '.json', '.html'],
            mainFields: ['svelte', 'module', 'browser', 'main'],
        },
        externals: Object.keys(pkg.dependencies),
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: {
                        loader: 'svelte-loader',
                        options: {
                            css: false,
                            generate: 'ssr',
                            dev,
                            preprocess: {
                                style: configUtils.sass,
                            },
                        },
                    },
                },
            ],
        },
        mode: process.env.NODE_ENV,
        performance: {
            hints: false, // it doesn't matter if server.js is large
        },
    },

    serviceworker: {
        entry: config.serviceworker.entry(),
        output: config.serviceworker.output(),
        mode: process.env.NODE_ENV,
    },
};
