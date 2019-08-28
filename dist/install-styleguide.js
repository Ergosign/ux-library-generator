#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fsExtra = require("fs-extra");
var path = require("path");
//process.env.PWD is node_modules/ux-library-generator
//process.env.PROJECT_DIR is not always available
var projectDir;
if (process.env.INIT_CWD) {
    projectDir = process.env.INIT_CWD;
}
else {
    console.warn('!Could not detect project directory!');
    console.warn('Environment variable INIT_CWD is not set.\nPlease use npm scripts to run the install script of this package');
    projectDir = process.env.PWD;
}
var packageJson = fsExtra.readJSONSync(path.join(projectDir, 'package.json'));
if (!packageJson.hasOwnProperty('scripts')) {
    packageJson.scripts = {};
}
var changed = false;
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
if (!fsExtra.existsSync(path.join(projectDir, 'ux-library-config/data/site.json'))) {
    fsExtra.ensureDirSync(path.join(projectDir, 'ux-library-config/data'));
    var styleguideData = path.join(projectDir, 'node_modules/ux-library-generator/styleguide-data/data/site.json');
    if (fsExtra.existsSync(styleguideData)) {
        fsExtra.copySync(styleguideData, path.join(projectDir, 'ux-library-config/data/site.json'));
    }
}
//# sourceMappingURL=install-styleguide.js.map