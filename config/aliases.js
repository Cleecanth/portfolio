const path = require('path');

module.exports = {
    '@sassConfig': path.resolve(__dirname, 'sass.config.scss'),
    '@global': path.resolve(__dirname, '../static/_sass/'),
    '@sass': path.resolve(__dirname, '../static/_sass/'),
    '~': path.resolve(__dirname, '../node_modules/'),
};
