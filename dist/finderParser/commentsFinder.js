"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var minimatch = require("minimatch");
var path = require("path");
var commentBlockRegex = /\/\*(.|\n)*?\*\//gmi;
function findKssCommentsInFile(filePath) {
    var returnArray = [];
    var fileContents = fs.readFileSync(filePath, { encoding: 'UTF-8' });
    fileContents = fileContents.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var commentsFound = fileContents.match(commentBlockRegex);
    if (commentsFound && commentsFound.length > 0) {
        commentsFound.forEach(function (comment) {
            var trimmedComment = comment.trim();
            if (trimmedComment.length > 0 && trimmedComment !== '') {
                var commentObject = {
                    comment: trimmedComment,
                    srcPath: filePath
                };
                returnArray.push(commentObject);
            }
        });
    }
    return returnArray;
}
exports.findKssCommentsInFile = findKssCommentsInFile;
function findCommentsInDirectory(directory, sourceMask, excludeMask) {
    var returnArray = [];
    var directoryContents = fs.readdirSync(directory);
    directoryContents.forEach(function (directoryItemPath) {
        if (minimatch(directoryItemPath, '.*')) {
            return;
        }
        var fullPath = directory + path.sep + directoryItemPath;
        var directoryItemLstat = fs.lstatSync(fullPath);
        if (directoryItemLstat.isDirectory()) {
            var directoryArray = findCommentsInDirectory(fullPath, sourceMask, excludeMask);
            returnArray = returnArray.concat(directoryArray);
        }
        else if (minimatch(directoryItemPath, sourceMask)) {
            if (!excludeMask || !minimatch(directoryItemPath, excludeMask)) {
                var commentsInFile = findKssCommentsInFile(fullPath);
                returnArray = returnArray.concat(commentsInFile);
            }
        }
    });
    return returnArray;
}
exports.findCommentsInDirectory = findCommentsInDirectory;
//# sourceMappingURL=commentsFinder.js.map