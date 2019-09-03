#!/usr/bin/env node
import replaceInFile from 'replace-in-file';
import * as fs from 'fs';


const commandLineArguments = process.argv;

let targetPath = commandLineArguments[2];

if (!targetPath || targetPath === '') {
  targetPath = 'src/environments';
}

const date = new Date();
console.log('New Day:', date);
const day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate();
const hour = date.getHours() > 10 ? date.getHours() : '0' + date.getHours();
const min = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes();
const SHORT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const month = SHORT_MONTH_NAMES[date.getMonth()];
const MILITARY_TIME_CODE_PLUS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M'];
const MILITARY_TIME_CODE_MINUS = ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
let timezoneLetter = 'Z';
const timezone = date.getTimezoneOffset() / 60;
if (timezone > 0) {
  timezoneLetter = MILITARY_TIME_CODE_PLUS[Math.floor(timezone) - 1];
} else if (timezone < 0) {
  timezoneLetter = MILITARY_TIME_CODE_MINUS[Math.floor(timezone * (-1)) - 1];
}
const year = ('' + date.getFullYear()).substring(2, 4);
// const dateString = '' + day + hour + min + timezoneLetter + month + year;
const dateString = '' + day + '.' + month + '.' + year + ' - ' + hour + ':' + min;
console.log('New Date String:', dateString);
const options = {
  files: [
    targetPath+ '/environment.prod.ts',
    targetPath+ '/environment.ts'
  ],
  from: /productionDate: '(.*)'/g,
  to: 'productionDate: \'' + dateString + '\'',
  allowEmptyPaths: false
};

try {
  replaceInFile.sync(options);
} catch (error) {
  console.error('Error occurred:', error);
}

const packageJsonPath = process.cwd() + '/package.json';

if (fs.existsSync(packageJsonPath)) {
  const packageDetails = require(packageJsonPath);
  console.log('Version from Package File: ' + packageDetails.version);
  const versionSource = 'export const APP_VERSION = \'' + packageDetails.version + '\';\n';
  fs.writeFile( targetPath+ '/version.ts', versionSource, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The version file was updated.");
  });
} else {
  console.log('No package.json found - can set version information.');
}
