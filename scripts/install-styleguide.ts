#!/usr/bin/env node

import * as fsExtra from 'fs-extra';
import * as path from 'path';


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

const configJsonFilePath = `${projectRootFolder}/${configFilePath}`;

// process.env.PWD is node_modules/ux-library-generator
// process.env.PROJECT_DIR is not always available

let projectDir;
if (process.env.INIT_CWD) {
  projectDir = process.env.INIT_CWD;
} else {
  console.warn('!Could not detect project directory!');
  console.warn('Environment variable INIT_CWD is not set.\nPlease use npm scripts to run the install script of this package');
  projectDir = process.env.PWD;
}

const packageJson = fsExtra.readJSONSync(path.join(projectDir, 'package.json'));
if (!packageJson.hasOwnProperty('scripts')) {
  packageJson.scripts = {};
}
let changed = false;
if (!packageJson.scripts.hasOwnProperty('generate-ux-library')) {
  packageJson.scripts['generate-ux-library'] = 'ux-library-generator-copy-files && ux-library-generator-generate';
  changed = true;
}
if (!packageJson.scripts.hasOwnProperty('ux-library-serve')) {
  packageJson.scripts['ux-library-serve'] = 'grunt run';
  changed = true;
}
if (!packageJson.scripts.hasOwnProperty('start-ux-library')) {
  packageJson.scripts['start-ux-library'] = 'ux-library-generator-copy-files && ux-library-generator-generate && "ux-library-generator-generate watch" "npm run ux-library-serve"';
  changed = true;
}
// if (!packageJson.scripts.hasOwnProperty('build-ux-library')) {
//     packageJson.scripts['build-ux-library'] = 'ng build styleguide --prod';
//     changed = true;
// }
if (changed) {
  fsExtra.writeJsonSync(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 });
}

if (!fsExtra.existsSync(configJsonFilePath)) {
  const configDirectory = configJsonFilePath.substring(0, configJsonFilePath.lastIndexOf('/'));
  fsExtra.ensureDirSync(configDirectory);
  const styleguideData = path.join(projectDir, 'node_modules/ux-library-generator/styleguide-data/data/site.json');
  if (fsExtra.existsSync(styleguideData)) {
    fsExtra.copySync(styleguideData, configJsonFilePath);
  }
}
