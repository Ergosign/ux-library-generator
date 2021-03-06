import * as assemble from 'assemble';

import * as colors from 'colors/safe';

import { registerHandlebarsHelpers } from './handlebarsHelpers/handlebarsHelpers';
import { registerHandlebarsHelpersMarkup } from './handlebarsHelpers/markupHelpers';
import { registerHandlebarsHelpersStyleguide } from './handlebarsHelpers/styleguideHelpers';
import { registerExtraHandlebarsHelpers } from './handlebarsHelpers/registerExtraHandlebarsHelpers';
import { setupContent, parseSiteJson } from './setup/setupContent';
import { Bundler } from 'scss-bundle';

import * as handlebarsHelpers from 'handlebars-helpers';
import * as baseWatch from 'base-watch';
import * as gulpExtName from 'gulp-extname';

import * as fsExtra from 'fs-extra';

const helpers = handlebarsHelpers();

const RENDER_PRE_CODE_BLOCK_START_MARKER = '!@--RENDER-CODE-START--!@';
const RENDER_PRE_CODE_BLOCK_END_MARKER = '!@--RENDER-CODE-STOP--!@';

const app = assemble();

export async function startGeneration(projectRootFolder: string, configFilePath: string, done: () => void) {
  // load the data
  const uxLibraryConfig = parseSiteJson(projectRootFolder, configFilePath);

  console.info(colors.green(`Loading partials and layouts...`));

  const pathToPartials = uxLibraryConfig.componentPath ? uxLibraryConfig.componentPath + '/**/*.hbs' : null;
  console.info(`Path to partials: ${pathToPartials}`);
  // configure the partials and layouts
  app.task('load', (cb) => {
    app.data([`${uxLibraryConfig.dataFilesPath}/*.json`, uxLibraryConfig.examplePagesSourcePath + '/*.json']);
    app.partials([`${uxLibraryConfig.partialsPath}/*.hbs`, pathToPartials ? pathToPartials : '']);
    app.layouts([`${uxLibraryConfig.layoutsPath}/*.hbs`]);
    cb();
  });

  // register additional handlebars helpers
  const handlebarsEngine = app.engines['.hbs'].Handlebars;
  registerHandlebarsHelpers(handlebarsEngine);
  registerHandlebarsHelpersMarkup(handlebarsEngine, app.engines['.hbs']);
  registerHandlebarsHelpersStyleguide(handlebarsEngine);
  app.helper(helpers);

  app.use(baseWatch());

  // Add some logging
  app.on('postRender', (view) => {
    const originalContent = view.content + '';
    let transformedContent = originalContent;
    while (transformedContent.includes(RENDER_PRE_CODE_BLOCK_START_MARKER)) {
      // we need to replace some sections of the document
      const searchIndex = transformedContent.indexOf(RENDER_PRE_CODE_BLOCK_START_MARKER);
      const endIndex = transformedContent.indexOf(RENDER_PRE_CODE_BLOCK_END_MARKER) + RENDER_PRE_CODE_BLOCK_END_MARKER.length;

      const stringToRemove = transformedContent.substr(searchIndex, endIndex - searchIndex);

      const removePlaceHolders = stringToRemove.replace(RENDER_PRE_CODE_BLOCK_START_MARKER, '').replace(RENDER_PRE_CODE_BLOCK_END_MARKER, '');

      let escapedString = handlebarsEngine.Utils.escapeExpression(removePlaceHolders).trim();

      transformedContent = transformedContent.substr(0, searchIndex) + escapedString + transformedContent.substr(endIndex);
    }
    view.content = transformedContent;
    console.info(colors.yellow('Generated ==>'), colors.green(view.relative));
  });



  app.helper('escapifyContents', function(str, options) {

    if (typeof str == 'object') {
      options = str;
    }

    const context = { ...this.context,...options.data.root, ...this };
    const wrapped = options.fn(context);
    const returnString = `${RENDER_PRE_CODE_BLOCK_START_MARKER}${wrapped}${RENDER_PRE_CODE_BLOCK_END_MARKER}`;

    return returnString;
  });


  // setup our elements
  app.create('uxLibraryElements', {
    engine: app.options.engine || 'hbs'
  });

  // configure the build
  app.task('default', ['load'], () => {
    setupContent(app, uxLibraryConfig);
    const returnValue = app.toStream('uxLibraryElements')
      .pipe(app.renderFile())
      .pipe(app.dest('./'));
    return returnValue;
  });

  /**
   * Task that renders example layout pages that specify their surrounding layout inside their hbs file and have their associated data inside a json file with the same file name inside the same folder.
   */
  app.task('buildPages', () => {
    // rename file extension (using gulpExtName) from .hbs to .html because assemble doesn't do it anymore: https://github.com/assemble/assemble/issues/633
    app.src((uxLibraryConfig.examplePagesSourcePath) + '/**/*.hbs')
      .pipe(gulpExtName())
      .pipe(app.renderFile())
      .pipe(app.dest(uxLibraryConfig.examplePagesTargetPath));
  });

  app.task('bundleScss', ['load'], () => {
    if (uxLibraryConfig.scssPath) {
      const files = fsExtra.readdirSync(uxLibraryConfig.scssPath);
      const bundler = new Bundler();
      files.forEach((value) => {
        bundler.bundle(uxLibraryConfig.scssPath + '/' + value, undefined, undefined, files)
          .then((bundle) => {
            fsExtra.writeFileSync(`${projectRootFolder}/${uxLibraryConfig.targetPath}/${uxLibraryConfig.assetTargetPath}/scss/${value}`, bundle.bundledContent);
          });
      });
    }
  });

  // register project specific handlebars helpers
  await registerExtraHandlebarsHelpers(handlebarsEngine, uxLibraryConfig);

  // start the assembly
  app.build(['default', 'buildPages'], (err) => {
    if (err) {
      console.error('ERROR:', err);
    }
    done();
  });

}
