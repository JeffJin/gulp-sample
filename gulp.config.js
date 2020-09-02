module.exports = function() {
    var config = {
        allJs: [
            './src/**/*.js',
            './*.js'
        ],
        sass: './src/client/styles/styles.scss',
        js:[
            './src/client/app/**/*.module.js',
            './src/client/app/**/*.js',
            '!./src/client/app/**/*.spec.js'
        ],
        client:'./src/client/',
        index:'./src/client/index.html',
        css:'./temp/styles.css',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..',
        },
        nodeServer: './src/server/app.js',
        server: './src/server/',
        temp:'./temp/'
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath,
        };

        return options;
    };
    return config;
};
