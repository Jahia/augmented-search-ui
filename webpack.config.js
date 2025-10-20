const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {CycloneDxWebpackPlugin} = require('@cyclonedx/webpack-plugin');

/** @type {import('@cyclonedx/webpack-plugin').CycloneDxWebpackPluginOptions} */
const cycloneDxWebpackPluginOptions = {
    specVersion: '1.4',
    rootComponentType: 'library',
    outputLocation: './bom'
};

module.exports = (env, argv) => {
    const config = {
        entry: {
            'augmented-search-ui-polyfills': [path.resolve(__dirname, 'src/javascript/app', 'polyfills.js')],
            'augmentedSearchUIApp': [path.resolve(__dirname, 'src/javascript/app', 'index.js')]
        },

        output: {
            path: path.resolve(__dirname + '/src/main/resources/javascript/app/'),
            filename: "[name].js"
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', '.json']
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    include: /node_modules/,
                    type: "javascript/auto"
                },
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    dependency: { not: ['url'] }
                }
            ]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'augmented-search-ui-vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        plugins: [
            new CycloneDxWebpackPlugin(cycloneDxWebpackPluginOptions)
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.watch) {
        config.module.rules.push({
            test: /\.jsx?$/,
            include: [path.join(__dirname, 'src')],
            exclude: /node_modules/,
            enforce: 'pre',
            loader: 'eslint-loader',
            options: {
                quiet: true,
                fix: true
            }
        });
    }

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
