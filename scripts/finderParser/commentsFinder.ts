import { readFileSync, readdirSync, lstatSync } from 'fs';
import * as minimatch from 'minimatch';
import { sep as pathSeperator } from 'path';

const commentBlockRegex = /\/\*(.|\n)*?\*\//gmi;

export function findKssCommentsInFile(filePath) {

  const returnArray = [];

  let fileContents = readFileSync(filePath, {encoding: 'UTF-8'});

  fileContents = fileContents.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const commentsFound = fileContents.match(commentBlockRegex);

  if (commentsFound && commentsFound.length > 0) {
    commentsFound.forEach((comment) => {
      const trimmedComment = comment.trim();
      if (trimmedComment.length > 0 && trimmedComment !== '') {
        const commentObject = {
          comment: trimmedComment,
          srcPath: filePath
        };
        returnArray.push(commentObject);
      }
    });
  }

  return returnArray;

}

export function findCommentsInDirectory(directory, sourceMask, excludeMask) {

  let returnArray = [];

  const directoryContents = readdirSync(directory);

  directoryContents.forEach((directoryItemPath) => {
    if (minimatch(directoryItemPath, '.*')) {
      return;
    }
    const fullPath = directory + pathSeperator + directoryItemPath;
    const directoryItemLstat = lstatSync(fullPath);
    if (directoryItemLstat.isDirectory()) {
      const directoryArray = findCommentsInDirectory(fullPath, sourceMask, excludeMask);
      returnArray = returnArray.concat(directoryArray);
    } else if (minimatch(directoryItemPath, sourceMask)) {
      if (!excludeMask || !minimatch(directoryItemPath, excludeMask)) {
        const commentsInFile = findKssCommentsInFile(fullPath);
        returnArray = returnArray.concat(commentsInFile);
      }
    }
  });

  return returnArray;
}
