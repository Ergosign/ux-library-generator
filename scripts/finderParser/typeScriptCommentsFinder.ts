import * as fs from 'fs';
import * as minimatch from 'minimatch';
import * as path from 'path';

const commentBlockRegex = /\/\*(.|\n)*?\*\//gmi;

export function findKssCommentsInFile(filePath) {

  const returnArray = [];

  let fileContents = fs.readFileSync(filePath, {encoding: 'UTF-8'});

  fileContents = fileContents.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const commentsFound = fileContents.match(commentBlockRegex);

  if (commentsFound && commentsFound.length > 0) {
    commentsFound.forEach(function (comment) {
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

  const directoryContents = fs.readdirSync(directory);

  directoryContents.forEach(function (directoryItemPath) {
    if (minimatch(directoryItemPath, '.*')) {
      return;
    }
    const fullPath = directory + path.sep + directoryItemPath;
    const directoryItemLstat = fs.lstatSync(fullPath);
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
