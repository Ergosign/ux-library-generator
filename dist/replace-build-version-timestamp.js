#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceInFile = require("replace-in-file");
var fs = require("fs");
var commandLineArguments = process.argv;
var targetPath = commandLineArguments[2];
if (!targetPath || targetPath === '') {
    targetPath = 'src/environments';
}
var date = new Date();
console.log('New Day:', date);
var day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate();
var hour = date.getHours() > 10 ? date.getHours() : '0' + date.getHours();
var min = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes();
var SHORT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
var month = SHORT_MONTH_NAMES[date.getMonth()];
var MILITARY_TIME_CODE_PLUS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M'];
var MILITARY_TIME_CODE_MINUS = ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
var timezoneLetter = 'Z';
var timezone = date.getTimezoneOffset() / 60;
if (timezone > 0) {
    timezoneLetter = MILITARY_TIME_CODE_PLUS[Math.floor(timezone) - 1];
}
else if (timezone < 0) {
    timezoneLetter = MILITARY_TIME_CODE_MINUS[Math.floor(timezone * (-1)) - 1];
}
var year = ('' + date.getFullYear()).substring(2, 4);
// const dateString = '' + day + hour + min + timezoneLetter + month + year;
var dateString = '' + day + '.' + month + '.' + year + ' - ' + hour + ':' + min;
console.log('New Date String:', dateString);
var options = {
    files: [
        targetPath + '/environment.prod.ts',
        targetPath + '/environment.ts'
    ],
    from: /productionDate: '(.*)'/g,
    to: 'productionDate: \'' + dateString + '\'',
    allowEmptyPaths: false
};
try {
    replaceInFile.sync(options);
}
catch (error) {
    console.error('Error occurred:', error);
}
var packageJsonPath = process.cwd() + '/package.json';
if (fs.existsSync(packageJsonPath)) {
    var packageDetails = require(packageJsonPath);
    console.log('Version from Package File: ' + packageDetails.version);
    var versionSource = 'export const APP_VERSION = \'' + packageDetails.version + '\';\n';
    fs.writeFile(targetPath + '/version.ts', versionSource, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The version file was updated.");
    });
}
else {
    console.log('No package.json found - can set version information.');
}
//# sourceMappingURL=replace-build-version-timestamp.js.map