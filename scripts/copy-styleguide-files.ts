#!/usr/bin/env node

import * as fsExtra from 'fs-extra';
import { parseSiteJson, SiteJson } from "./setup/setupContent";
import { Bundler } from 'scss-bundle';

// copy styleguide data
fsExtra.copySync('node_modules/ux-library-generator/styleguide-data', '.tmp/styleguide-data');
if (fsExtra.pathExistsSync('ux-library-config/')) {
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
} else {
    console.log('configuration directory for ux-library missing. \nCreate empty directory');
    fsExtra.ensureDirSync('ux-library-config/');
    fsExtra.copySync('ux-library-config/', '.tmp/styleguide-data');
}

const siteData: SiteJson = parseSiteJson();

if (siteData.assetPath) {
    fsExtra.copySync(siteData.assetPath, '.tmp/styleguide/src/assets');
}
if (siteData.scssPath) {
    var files = fsExtra.readdirSync(siteData.scssPath);
    var bundler = new Bundler();
    fsExtra.ensureDirSync('.tmp/styleguide/src/assets/scss/');
    files.forEach(value => {
        bundler.Bundle(siteData.scssPath + '/' + value, undefined, undefined, files)
            .then(bundle => {
                fsExtra.writeFileSync('.tmp/styleguide/src/assets/scss/' + value, bundle.bundledContent);
            })
    });
}

fsExtra.copySync('node_modules/ux-library-generator/tsconfig.json', '.tmp/styleguide/tsconfig.json');