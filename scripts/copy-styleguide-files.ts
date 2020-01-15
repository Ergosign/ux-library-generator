#!/usr/bin/env node

import * as fsExtra from 'fs-extra';
import { parseSiteJson } from './setup/setupContent';
import { Bundler } from 'scss-bundle';

import { UxLibraryConfig } from './typings';

let projectRootFolder = '.';
let configFilePath = 'src/ux-library/ux-library-config.json';
const commandLineArguments = process.argv;

commandLineArguments.forEach((argument, index) => {

  switch (argument) {
    case '--config':
      // load parameter
      if (commandLineArguments.length === index) {
        console.error(`--config parameter provided but no value given`);
        return;
      }
      configFilePath = commandLineArguments[index + 1];
      console.info(`Using provided config file : ${configFilePath}`);
      break;
    case '--rootFolder':
      // load parameter
      if (commandLineArguments.length === index) {
        console.error(`--rootFolder parameter provided but no value given`);
        return;
      }
      projectRootFolder = commandLineArguments[index + 1];
      console.info(`Using provided project root folder : ${projectRootFolder}`);
      break;
  }

});

// copy styleguide data
fsExtra.copySync('node_modules/ux-library-generator/ux-library-data', '.tmp/styleguide-data');
if (fsExtra.pathExistsSync('ux-library-config/')) {
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
} else {
    console.log('configuration directory for ux-library missing. \nCreate empty directory');
    fsExtra.ensureDirSync('ux-library-config/');
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
}

const uxLibraryConfig: UxLibraryConfig = parseSiteJson(projectRootFolder, configFilePath);

if (uxLibraryConfig.assetPath) {
    fsExtra.copySync(uxLibraryConfig.assetPath, '.tmp/styleguide/src/assets');
}
if (uxLibraryConfig.scssPath) {
    const files = fsExtra.readdirSync(uxLibraryConfig.scssPath);
    const bundler = new Bundler();
    fsExtra.ensureDirSync('.tmp/styleguide/src/assets/scss/');
    files.forEach((value) => {
        bundler.bundle(uxLibraryConfig.scssPath + '/' + value, undefined, undefined, files)
            .then((bundle) => {
                fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
            });
    });
}

fsExtra.copySync('node_modules/ux-library-generator/tsconfig.json', '.tmp/styleguide/tsconfig.json');
