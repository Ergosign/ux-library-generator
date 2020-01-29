#!/usr/bin/env node

import * as fsExtra from 'fs-extra';
import * as path from 'path';

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

let projectDir;
if (process.env.INIT_CWD) {
  projectDir = process.env.INIT_CWD;
} else {
  console.warn('!Could not detect project directory!');
  console.warn('Environment variable INIT_CWD is not set.\nPlease use npm scripts to run the install script of this package');
  projectDir = process.env.PWD;
}

const uxLibraryConfig: UxLibraryConfig = parseSiteJson(projectRootFolder, configFilePath);

// const styleguideDataFolder = path.join(projectDir, 'node_modules/ux-library-generator/styleguide-data/data');
// if (fsExtra.existsSync(styleguideDataFolder)) {
//   // copy styleguide data
//   fsExtra.copySync(styleguideDataFolder, uxLibraryConfig.targetPath);
//   if (fsExtra.pathExistsSync('ux-library-config/')) {
//     fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
//   } else {
//     console.log('configuration directory for ux-library missing. \nCreate empty directory');
//     fsExtra.ensureDirSync('ux-library-config/');
//     fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
//   }
// }



if (uxLibraryConfig.assetPath) {
    fsExtra.copySync(uxLibraryConfig.assetPath, `${uxLibraryConfig.targetPath}/${uxLibraryConfig.assetPath}`);
}
if (uxLibraryConfig.scssPath) {
    const files = fsExtra.readdirSync(uxLibraryConfig.scssPath);
    const bundler = new Bundler();
    fsExtra.ensureDirSync(`${uxLibraryConfig.targetPath}/${uxLibraryConfig.assetPath}/scss`);
    files.forEach((value) => {
        bundler.bundle(uxLibraryConfig.scssPath + '/' + value, undefined, undefined, files)
            .then((bundle) => {
                fsExtra.writeFileSync(`${uxLibraryConfig.targetPath}/${uxLibraryConfig.assetPath}/scss/${value}`, bundle.bundledContent);
            });
    });
}

// fsExtra.copySync('node_modules/ux-library-generator/tsconfig.json', '.tmp/styleguide/tsconfig.json');
