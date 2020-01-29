#!/usr/bin/env node

import { startGeneration } from './uxLibraryGenerator';
import * as colors from 'colors/safe';

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

console.info(colors.green(`Starting UX Library Generator....`));
startGeneration(projectRootFolder, configFilePath, () => {
  console.info(colors.green(`UX Library Generation Completed.`));
});
