#!/usr/bin/env node

import * as fsExtra from 'fs-extra';
import { parseSiteJson } from "./setup/setupContent";
import { Bundler } from 'scss-bundle';

import { SiteJson } from './typings'

let projectRootFolder = 'example';
let configFilePath = "styleguide-data/data/site.json"
const commandLineArguments = process.argv;

commandLineArguments.forEach((argument, index) => {

  switch (argument) {
    case "--config":
      //load parameter
      if (commandLineArguments.length === index) {
        console.error(`--config parameter provided but no value given`);
        return;
      }
      configFilePath = commandLineArguments[index + 1];
      console.info(`Using provided config file : ${configFilePath}`);
      break;
    case "--rootFolder":
      //load parameter
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
fsExtra.copySync('node_modules/ux-library-generator/styleguide-data', '.tmp/styleguide-data');
if (fsExtra.pathExistsSync('ux-library-config/')) {
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
} else {
    console.log('configuration directory for ux-library missing. \nCreate empty directory');
    fsExtra.ensureDirSync('ux-library-config/');
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
}

const siteData: SiteJson = parseSiteJson(projectRootFolder,configFilePath);

if (siteData.assetPath) {
    fsExtra.copySync(siteData.assetPath, '.tmp/styleguide/src/assets');
}
if (siteData.scssPath) {
    var files = fsExtra.readdirSync(siteData.scssPath);
    var bundler = new Bundler();
    fsExtra.ensureDirSync('.tmp/styleguide/src/assets/scss/');
    files.forEach(value => {
        bundler.bundle(siteData.scssPath + '/' + value, undefined, undefined, files)
            .then(bundle => {
                fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
            })
    });
}

fsExtra.copySync('node_modules/ux-library-generator/tsconfig.json', '.tmp/styleguide/tsconfig.json');
