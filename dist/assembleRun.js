#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assemble = require("assemble");
var handlebarsHelpers = require("handlebars-helpers");
var baseWatch = require("base-watch");
var gulpExtName = require("gulp-extname");
var handlebarsHelpers_1 = require("./handlebarsHelpers/handlebarsHelpers");
var markupHelpers_1 = require("./handlebarsHelpers/markupHelpers");
var styleguideHelpers_1 = require("./handlebarsHelpers/styleguideHelpers");
var setupContent_1 = require("./setup/setupContent");
var process = require("process");
var fsExtra = require("fs-extra");
var scss_bundle_1 = require("scss-bundle");
var helpers = handlebarsHelpers();
var prettify = require('pretty');
var app = assemble();
var siteData = setupContent_1.parseSiteJson();
var pathToPartials = siteData.componentPath ? siteData.componentPath + '/**/*.hbs' : null;
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
var handlebarsEngine = app.engines['.hbs'].Handlebars;
handlebarsHelpers_1.registerHandlebarsHelpers(handlebarsEngine);
markupHelpers_1.registerHandlebarsHelpersMarkup(handlebarsEngine, app.engines['.hbs']);
styleguideHelpers_1.registerHandlebarsHelpersStyleguide(handlebarsEngine);
app.helper(helpers);
app.use(baseWatch());
app.asyncHelper('markupWithStyleForCodebox', function (options, cb) {
    var context = this;
    if (!context || !context.markup) {
        return '';
    }
    var markup = context.markup;
    var markupContext = context.markupContext;
    var template;
    if (markup.search(/.*\.hbs/gi) === 0) {
        var mName = markup.replace(".hbs", "");
        // we are using the regular handlebars version here, as the engine-handlebars version will
        // not completely render the partial synchronously and therefore escaping the string is not possible.
        template = handlebarsEngine.compile(handlebarsEngine.partials[mName]);
    }
    else {
        template = handlebarsEngine.compile(markup);
    }
    console.log('now rendering:');
    var renderResult = app.engine('.hbs')
        .renderSync(template, markupContext);
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
    siteData = setupContent_1.setupContent(app);
    var returnValue = app.toStream('uxLibraryElements')
        .pipe(app.renderFile())
        .pipe(app.dest('./'));
    return returnValue;
});
/**
 * Task that renders example layout pages that specify their surrounding layout inside their hbs file and have their associated data inside a json file with the same file name inside the same folder.
 */
app.task('buildPages', function () {
    // rename file extension (using gulpExtName) from .hbs to .html because assemble doesnt do it anymore: https://github.com/assemble/assemble/issues/633
    app.src((siteData.examplePagesSourcePath) + '/**/*.hbs')
        .pipe(gulpExtName())
        .pipe(app.renderFile())
        .pipe(app.dest(siteData.examplePagesTargetPath));
});
app.task('bundleScss', ['load'], function () {
    siteData = setupContent_1.parseSiteJson();
    if (siteData.scssPath) {
        var files_1 = fsExtra.readdirSync(siteData.scssPath);
        var bundler_1 = new scss_bundle_1.Bundler();
        files_1.forEach(function (value) {
            bundler_1.bundle(siteData.scssPath + '/' + value, undefined, undefined, files_1)
                .then(function (bundle) {
                fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
            });
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
var commandLineArguments = process.argv;
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
//# sourceMappingURL=assembleRun.js.map