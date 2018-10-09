const path = require('path');

const PATHS = {
    aliases: {
        '@sassConfig': path.resolve(__dirname, 'sass.config.scss'),
        '@global': path.resolve(__dirname, '../static/_sass/'),
        '~node': path.resolve(__dirname, '../node_modules'),
    },
};

module.exports = function aliasPath(url) {
    const aliases = Object.keys(PATHS.aliases);
    const match = aliases.filter((alias) => url.indexOf(alias) > -1);

    return {
        file: match[0]
            ? path.resolve(
                  PATHS.aliases[match[0]],
                  url.replace(match[0] + '/', '').replace(match[0], '')
              )
            : url,
    };
};
