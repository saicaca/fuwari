const path = require('path');
const chalk = require('chalk');
const maxmin = require('maxmin');

module.exports = function() {
    return {
        name: 'rollup-plugin-bundle-size',
        generateBundle(options, bundle) {
            const asset = path.basename(options.file);
            const size = maxmin(bundle[asset].code, bundle[asset].code, true);
            console.log(`Created bundle ${chalk.cyan(asset)}: ${size.substr(size.indexOf(' → ') + 3)}`);
        }
    };
};
