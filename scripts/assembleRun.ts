#!/usr/bin/env node

import { startGeneration } from './uxLibraryGenerator';
import * as colors from 'colors/safe';

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

console.info(colors.green(`Starting Generator....`));
startGeneration(projectRootFolder, configFilePath, () => {
  console.info(colors.green(`Generation complete`));
});
