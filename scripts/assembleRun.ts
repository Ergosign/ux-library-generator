#!/usr/bin/env node

import * as assemble from 'assemble';
import * as handlebarsHelpers from 'handlebars-helpers';
import * as baseWatch from 'base-watch';
import * as gulpExtName from 'gulp-extname';

import { registerHandlebarsHelpers } from './handlebarsHelpers/handlebarsHelpers';
import { registerHandlebarsHelpersMarkup } from './handlebarsHelpers/markupHelpers';
import { registerHandlebarsHelpersStyleguide } from './handlebarsHelpers/styleguideHelpers';
import { setupContent, parseSiteJson } from './setup/setupContent';
import * as process from 'process';
import * as fsExtra from 'fs-extra';
import { Bundler } from 'scss-bundle';

const helpers = handlebarsHelpers();
let prettify = require('pretty');

const app = assemble();

let siteData = parseSiteJson();
const pathToPartials = siteData.componentPath ? siteData.componentPath + '/**/*.hbs' : null;

// configure the partials and layouts
app.task('load', function (cb) {
    app.data(['.tmp/styleguide-data/data/*.json', './src/html/pages/*.json']);
    app.partials(['.tmp/styleguide-data/partials/*.hbs', pathToPartials ? pathToPartials : '']);
    app.layouts(['.tmp/styleguide-data/layouts/*.hbs', '.tmp/styleguide-data/partials/*.hbs']);
    cb();
});

// Add some logging
app.on('preRender', function (view) {
    console.log('  generating ux library >', view.relative);
});

const handlebarsEngine = app.engines['.hbs'].Handlebars;
registerHandlebarsHelpers(handlebarsEngine);
registerHandlebarsHelpersMarkup(handlebarsEngine, app.engines['.hbs']);
registerHandlebarsHelpersStyleguide(handlebarsEngine);

app.helper(helpers);
app.use(baseWatch());

app.asyncHelper('markupWithStyleForCodebox', function (options, cb) {
    let context = this;

    if (!context || !context.markup) {
        return '';
    }

    let markup = context.markup;
    let markupContext = context.markupContext;

    let template;

    if (markup.search(/.*\.hbs/gi) === 0) {
        let mName = markup.replace(".hbs", "");
        // we are using the regular handlebars version here, as the engine-handlebars version will
        // not completely render the partial synchronously and therefore escaping the string is not possible.
        template = handlebarsEngine.compile(handlebarsEngine.partials[mName]);
    } else {
        template = handlebarsEngine.compile(markup);
    }

    console.log('now rendering:');
    let renderResult = app.engine('.hbs')
        .render(template, markupContext);

    console.log(renderResult);
    cb(null, handlebarsEngine.Utils.escapeExpression(prettify(renderResult.trim())));

    // let html = app.engine.renderSync(template, markupContext);
    // html = handlebarsEngine.Utils.escapeExpression(prettify(html));
    //
    // return html;
});

app.create('uxLibraryElements', {
    engine: app.options.engine || 'hbs'
});

// configure the build
app.task('default', function () {

    siteData = setupContent(app);
    const returnValue = app.toStream('uxLibraryElements')
        .pipe(app.renderFile())
        .pipe(app.dest('./'));

    return returnValue;
});

/**
 * Task that renders example layout pages that specify their surrounding layout inside their hbs file and have their associated data inside a json file with the same file name inside the same folder.
 */
app.task('buildPages', function () {
    // rename file extension (using gulpExtName) from .hbs to .html because assemble doesn't do it anymore: https://github.com/assemble/assemble/issues/633

    app.src((siteData.examplePagesSourcePath) + '/**/*.hbs')
        .pipe(gulpExtName())
        .pipe(app.renderFile())
        .pipe(app.dest(siteData.examplePagesTargetPath));
});

app.task('bundleScss', ['load'], function () {
    siteData = parseSiteJson();
    if (siteData.scssPath) {
        let files = fsExtra.readdirSync(siteData.scssPath);
        let bundler = new Bundler();
        files.forEach(value => {
            bundler.bundle(siteData.scssPath + '/' + value, undefined, undefined, files)
                .then(bundle => {
                    fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
                })
        });
    }
});

// app.build(['default'], function (err) {
//     if (err) {
//         console.error('ERROR:', err);
//     }
// });

app.build(['load', 'default', 'buildPages'], function (err) {
    if (err) {
        console.error('ERROR:', err);
    }
});

const commandLineArguments = process.argv;

// if (commandLineArguments[2] === 'watch') {
//     app.task('watch', function () {
//         //TODO: config file for path?
//         const componentPath = siteData.componentPath;
//         app.watch(componentPath + '/**/*.scss', ['default']);
//         app.watch('**/*.scss', ['bundleScss']);
//     });
//
//     app.build(['watch'], function (err) {
//         if (err) {
//             console.error('ERROR:', err);
//         }
//     });
// }