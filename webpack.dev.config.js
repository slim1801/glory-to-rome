var webpack = require('webpack');
var path = require('path');

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },
    output: {
        path: root('dist'),
        publicPath: '/',
        filename: 'js/[name].js',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader?', 'angular2-template-loader'],
                exclude: [/node_modules\/(?!(ng2-.+))/]
            },
            {
                test: /\.(html|css)$/,
                loader: 'raw-loader', 
                exclude: root('src', 'public')
            },
            //file loader
            { test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, loader: "file-loader" },
            //json loader
            { test: /\.json$/, loader: 'json-loader' },
            //bootstrap
            { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] },
            { test: /bootstrap\/dist\/js\/umd\//, loader: 'imports-loader?jQuery=jquery' },
            //font awesome loader
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        
        new CommonsChunkPlugin({
            name: ['vendor', 'polyfills']
        }),

        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            root('./src') // location of your src
        ),

        new HtmlWebpackPlugin({
            template: './index.html',
            chunksSortMode: 'dependency'
        }),

        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
    ]
}

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}