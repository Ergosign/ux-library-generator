import * as assemble from 'assemble';

import * as colors from 'colors/safe';

import { registerHandlebarsHelpers } from './handlebarsHelpers/handlebarsHelpers';
import { registerHandlebarsHelpersMarkup } from './handlebarsHelpers/markupHelpers';
import { registerHandlebarsHelpersStyleguide } from './handlebarsHelpers/styleguideHelpers';
import { setupContent, parseSiteJson } from './setup/setupContent';
import { Bundler } from 'scss-bundle';

import * as handlebarsHelpers from 'handlebars-helpers';
import * as baseWatch from 'base-watch';
import * as gulpExtName from 'gulp-extname';

import * as fsExtra from 'fs-extra';

const helpers = handlebarsHelpers();

const app = assemble();

export function startGeneration (projectRootFolder: string, configFilePath: string, done: () => void) {
  //load the data
  const siteData = parseSiteJson(projectRootFolder, configFilePath);

  console.info(colors.green(`Loading partials and layouts...`));

  const pathToPartials = siteData.componentPath ? siteData.componentPath + '/**/*.hbs' : null;
  console.info(`Path to partials: ${pathToPartials}`);
  // configure the partials and layouts
  app.task('load', function (cb) {
    app.data([`${projectRootFolder}/styleguide-data/data/*.json`, './src/html/pages/*.json']);
    app.partials([`${projectRootFolder}/styleguide-data/partials/*.hbs`, pathToPartials ? pathToPartials : '']);
    app.layouts([`${projectRootFolder}/styleguide-data/layouts/*.hbs`]);
    cb();
  });
  // Add some logging
  app.on('preRender', function (view) {
    console.info(colors.yellow('Generating ==>'), colors.green(view.relative));
  });

  // register additional handlebars helpers
  const handlebarsEngine = app.engines['.hbs'].Handlebars;
  registerHandlebarsHelpers(handlebarsEngine);
  registerHandlebarsHelpersMarkup(handlebarsEngine, app.engines['.hbs']);
  registerHandlebarsHelpersStyleguide(handlebarsEngine);
  app.helper(helpers);

  app.use(baseWatch());

  // setup our elements
  app.create('uxLibraryElements', {
    engine: app.options.engine || 'hbs'
  });

  // configure the build
  app.task('default', ['load'], function () {
    setupContent(app, siteData);
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
    if (siteData.scssPath) {
      let files = fsExtra.readdirSync(siteData.scssPath);
      let bundler = new Bundler();
      files.forEach(value => {
        bundler.bundle(siteData.scssPath + '/' + value, undefined, undefined, files)
          .then(bundle => {
            fsExtra.writeFileSync(`${projectRootFolder}/.tmp/styleguide/src/assets/scss/${value}`, bundle.bundledContent);
          });
      });
    }
  });

  // start the assembly
  app.build(['default'], function (err) {
    if (err) {
      console.error('ERROR:', err);
    }
    done();
  });

}

