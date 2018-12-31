const webpack = require('webpack');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');
//const path = require('path');
const glob = require('fast-glob');

const mode = process.env.NODE_ENV || 'production';
const dev = mode === 'development';

const configUtils = require('./config/utils.js');
const preprocess = require('svelte-preprocess');
const aliases = require('./config/aliases.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const inlineFileSizeLimit = 4096;

const svelteLoader = (generate) => ({
    test: /\.(html|svelte)(\?.*)?$/,
    use: [
        {
            loader: 'babel-loader',
            options: configUtils.babel,
        },
        {
            loader: 'svelte-loader',
            options: {
                css: generate !== 'ssr',
                emitCss: !dev && generate !== 'ssr', // pass CSS to webpack
                hydratable: true,
                hotReload: dev,
                preserveComments: dev && generate !== 'ssr',
                generate,
                dev,
                externalDependencies: glob.sync([
                    './config/*.scss',
                    'static/**/*.scss',
                ]),
                preprocess: preprocess({
                    transformers: {
                        scss: configUtils.sass,
                        postcss: configUtils.postcss,
                    },
                }),
            },
        },
    ],
});

const sassLoader = ()=> ({
    test: /\.(s?css)(\?.*)?$/,
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
        'sass-loader',
        {
            loader: 'postcss-loader',
            options: {
                plugins: [
                    require('autoprefixer')({ grid: true }),

                    // Minify for production
                    !dev
                        ? require('cssnano')({
                              preset: [
                                  'default',
                                  {
                                      mergeLonghand: false,
                                      cssDeclarationSorter: false,
                                  },
                              ],
                          })
                        : false,
                ].filter(Boolean),
            },
        },
    ],
});

const mediaLoader = ()=> ({
    test: /\.(jpg|jpeg|png|gif|mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                limit: inlineFileSizeLimit,
                fallback: {
                    loader: 'file-loader',
                    options: {
                        name: `[hash]/[name].[ext]`,
                    },
                },
            },
        },
    ],
});

const svgLoader = ()=> ({
    test: /\.(svg)(\?.*)?$/,
    oneOf: [
        {
            resourceQuery: /inline/,
            use: {
                loader: 'svg-inline-loader',
            },
        },
        {
            loader: 'file-loader',
            options: {
                name: `[hash]/[name].svg`,
            },
        },
    ],
});

const fontLoader = ()=> ({
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
    use: [
        {
            loader: 'url-loader',
            options: {
                limit: inlineFileSizeLimit,
                fallback: {
                    loader: 'file-loader',
                    options: {
                        name: `[hash]/[name].[ext]`,
                    },
                },
            },
        },
    ],
});

module.exports = {
    client: {
        entry: config.client.entry(),
        output: config.client.output(),
        resolve: {
            alias: aliases,
            extensions: ['.js', '.json', '.html'],
            mainFields: ['svelte', 'module', 'browser', 'main'],
        },
        module: {
            rules: [
                /* js */
                {
                    test: /\.(js|jsx)$/,
                    enforce: 'post',
                    exclude: [
                        /node_modules\/core-js\//m,
                        /node_modules\/regenerator-runtime\//m,
                        /node_modules\/@?babel/,
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: configUtils.babel,
                    },
                },

                /* svelte */
                svelteLoader('dom'),

                /* sass */
                sassLoader(),

                /* svg */
                svgLoader(),

                /* various media */
                mediaLoader(),

                /* fonts */
                fontLoader(),
            ],
        },
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
        mode,
        devtool: dev && 'inline-source-map',
    },

    server: {
        entry: config.server.entry(),
        output: config.server.output(),
        target: 'node',
        resolve: {
            alias: aliases,
            extensions: ['.js', '.json', '.html'],
            mainFields: ['svelte', 'module', 'browser', 'main'],
        },
        externals: Object.keys(pkg.dependencies)
            .concat('encoding')
            .concat('node-sass-middleware')
            .concat('node-sass')
            .concat('postcss-middleware')
            .concat('autoprefixer'),
        module: {
            rules: [
                /* svelte */
                svelteLoader('ssr'),

                /* sass */
                sassLoader(),

                /* svg */
                svgLoader(),

                /* various media */
                mediaLoader(),

                /* fonts */
                fontLoader(),
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
        mode: process.env.NODE_ENV || 'production',
    },
};
