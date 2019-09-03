#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fsExtra = require("fs-extra");
var setupContent_1 = require("./setup/setupContent");
var scss_bundle_1 = require("scss-bundle");
// copy styleguide data
fsExtra.copySync('node_modules/ux-library-generator/styleguide-data', '.tmp/styleguide-data');
if (fsExtra.pathExistsSync('ux-library-config/')) {
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
}
else {
    console.log('configuration directory for ux-library missing. \nCreate empty directory');
    fsExtra.ensureDirSync('ux-library-config/');
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
}
var siteData = setupContent_1.parseSiteJson();
if (siteData.assetPath) {
    fsExtra.copySync(siteData.assetPath, '.tmp/styleguide/src/assets');
}
if (siteData.scssPath) {
    var files = fsExtra.readdirSync(siteData.scssPath);
    var bundler = new scss_bundle_1.Bundler();
    fsExtra.ensureDirSync('.tmp/styleguide/src/assets/scss/');
    files.forEach(function (value) {
        bundler.bundle(siteData.scssPath + '/' + value, undefined, undefined, files)
            .then(function (bundle) {
            fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
        });
    });
}
fsExtra.copySync('node_modules/ux-library-generator/tsconfig.json', '.tmp/styleguide/tsconfig.json');
//# sourceMappingURL=copy-styleguide-files.js.map