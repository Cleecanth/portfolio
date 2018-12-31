const path = require('path');
const aliases = require('./aliases.js');

const PATHS = {
    aliases,
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
