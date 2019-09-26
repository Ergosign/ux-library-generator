import { UxLibraryConfig } from './../typings.d';
import { readdirSync, lstatSync, exists, existsSync } from 'fs';
import * as minimatch from 'minimatch';
import { sep as pathSeperator } from 'path';
import * as colors from 'colors/safe';

const loadHandlebarsHelpersFromDirectory = async (handlebarsEngine, directory: string, sourceMask: string, excludeMask: string) => {

  if (!existsSync(directory)) {
    return;
  }

  const directoryContents = readdirSync(directory);

  // find the helpers
  for (const directoryItemPath of directoryContents) {
    if (minimatch(directoryItemPath, '.*')) {
      return;
    }
    const fullPath = directory + pathSeperator + directoryItemPath;
    const directoryItemLstat = lstatSync(fullPath);
    if (directoryItemLstat.isDirectory()) {
      await loadHandlebarsHelpersFromDirectory(handlebarsEngine, fullPath, sourceMask, excludeMask);
    } else if (minimatch(directoryItemPath, sourceMask)) {
      if (!excludeMask || !minimatch(directoryItemPath, excludeMask)) {
        console.info(colors.green(`Loading Handlebars Helper from: ${fullPath}`));
        // const dynamicHandlebarsHelper = import(fullPath).then(());
        const dynamicHandlebarsHelper = await import(fullPath);
        // const dynamicHandlebarsHelper = require(fullPath);
        dynamicHandlebarsHelper.register(handlebarsEngine);
      }
    }
  }
};

export async function registerExtraHandlebarsHelpers(handlebarsEngine, uxLibraryConfig: UxLibraryConfig) {
  const directory = process.env.PWD + '/' + uxLibraryConfig.additionalHandlebarsHelpersPath;
  const sourceMask = '*.js';
  const excludeMask = '';

  await loadHandlebarsHelpersFromDirectory(handlebarsEngine, directory, sourceMask, excludeMask);
}
