const path = require('path');
const sass = require('node-sass');

const babelConfig = {
    cacheDirectory: true,
    configFile: false,
    babelrc: false,
    ignore: [/@?babel/g, /core-js/g],
    sourceType: 'unambiguous',
    auxiliaryCommentBefore: 'Babel»',
    presets: [
        [
            require('@babel/preset-env'),
            {
                loose: true,
                modules: false,
                useBuiltIns: 'usage',
                debug: false,
            },
        ],
    ],
    plugins: [
        [
            require('@babel/plugin-transform-runtime'),
            {
                helpers: true,
                corejs: false,
                loose: true,
                useESModules: true,
            },
        ],
        [require('@babel/plugin-syntax-dynamic-import')],
    ],
};

const sassConfig = {
    outputStyle: 'expanded',
    errLogToConsole: true,
    includePaths: [path.resolve('../src'), path.resolve('../static')],
};

function processSass(input) {
    const content = input.content;
    const attributes = input.attributes;
    const filename = input.filename;

    if (
        attributes.type !== 'text/scss' &&
        attributes.type !== 'text/sass' &&
        attributes.lang !== 'scss' &&
        attributes.lang !== 'sass'
    ) {
        return;
    }
    try {
        sassConfig.data = content;
        sassConfig.outFile = filename;
        sassConfig.includePaths = [path.dirname(filename)];
        const result = sass.renderSync(sassConfig);

        return {
            code: result.css.toString('utf-8'),
            map: result.map,
        };
    } catch (e) {
        console.error(filename + '\n', new Error(e));
        return;
    }
}

module.exports = {
    babel: babelConfig,
    sass: processSass
};
