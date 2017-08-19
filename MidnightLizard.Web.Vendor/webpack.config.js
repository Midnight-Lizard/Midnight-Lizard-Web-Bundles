const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');

module.exports = (env) =>
{
    const extractCSS = new ExtractTextPlugin('vendor.css');
    const isDevBuild = !(env && env.prod) && (process.env.NODE_ENV !== 'production');
    const version = process.env.npm_package_version.replace(/\./g, '_');
    console.warn(`Vendor installed in ${isDevBuild ? 'dev' : 'prod'} mode`);
    const sharedConfig = {
        stats: { modules: false },
        resolve: { extensions: ['.js'] },
        module: {
            rules: [
                { test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' }
            ]
        },
        entry: {
            vendor: [
                '@angular/animations',
                '@angular/material',
                '@angular/flex-layout',
                '@angular/cdk',
                '@angular/common',
                '@angular/compiler',
                '@angular/core',
                '@angular/forms',
                '@angular/http',
                '@angular/platform-browser',
                '@angular/platform-browser-dynamic',
                '@angular/platform-server',
                '@angular/router',
                'es6-shim',
                'es6-promise',
                'event-source-polyfill',
                'jquery',
                'zone.js',
                'rxjs',
                'reflect-metadata'
            ]
        },
        output: {
            publicPath: '/dist/',
            filename: '[name].js',
            library: '[name]_' + version
        },
        plugins: [
            new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }), // Maps these identifiers to the jQuery package (because Bootstrap expects it to be a global variable)
            new webpack.ContextReplacementPlugin(/\@angular\b.*\b(bundles|linker)/, path.join(__dirname, '../../ClientApp')), // Workaround for https://github.com/angular/angular/issues/11580
            new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)@angular/, path.join(__dirname, '../../ClientApp')), // Workaround for https://github.com/angular/angular/issues/14898
            new webpack.IgnorePlugin(/^vertx$/) // Workaround for https://github.com/stefanpenner/es6-promise/issues/100
        ]
    };

    const clientBundleConfig = merge(sharedConfig, {
        entry: {
            vendor: [
                'hammerjs',
                'material-design-icons-iconfont/dist/material-design-icons.css',
                './themes/core-theme.scss'
            ]
        },
        output: { path: path.join(__dirname, '../../', 'wwwroot', 'dist') },
        module: {
            rules: [
                { test: /\.css(\?|$)/, use: extractCSS.extract({ use: isDevBuild ? 'css-loader' : 'css-loader?minimize' }) },
                {
                    test: /\.scss$/,
                    use: extractCSS.extract({ use: ['raw-loader', isDevBuild ? 'sass-loader' : 'sass-loader?minimize'] })
                }
            ]
        },
        plugins: [
            extractCSS,
            new webpack.DllPlugin({
                context: path.join(__dirname, '../../'),
                path: path.join(__dirname, '../../', 'wwwroot', 'dist', '[name]-manifest.json'),
                name: '[name]_' + version
            })
        ].concat(isDevBuild ? [] : [
            new webpack.optimize.UglifyJsPlugin({ comments: false, output: { comments: false } })
        ])
    });

    const serverBundleConfig = merge(sharedConfig, {
        target: 'node',
        entry: { vendor: ['aspnet-prerendering'] },
        resolve: { mainFields: ['main'] },
        output: {
            path: path.join(__dirname, '../../', 'ClientApp', 'dist'),
            libraryTarget: 'commonjs2',
        },
        module: {
            rules: [{ test: /\.css(\?|$)/, use: ['to-string-loader', isDevBuild ? 'css-loader' : 'css-loader?minimize'] }]
        },
        plugins: [
            new webpack.DllPlugin({
                path: path.join(__dirname, '../../', 'ClientApp', 'dist', '[name]-manifest.json'),
                name: '[name]_' + version
            })
        ]
    });

    return [clientBundleConfig, serverBundleConfig];
}
