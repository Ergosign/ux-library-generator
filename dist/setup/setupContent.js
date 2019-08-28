"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('lodash');
var fs = require("fs");
var fsExtra = require("fs-extra");
var typeScriptCommentsFinder_1 = require("../finderParser/typeScriptCommentsFinder");
var typeScriptCommentsParser_1 = require("../finderParser/typeScriptCommentsParser");
function parseSiteJson() {
    var siteFileContents = fs.readFileSync('.tmp/styleguide-data/data/site.json');
    var siteJson = JSON.parse(siteFileContents.toString());
    // set default values
    if (siteJson.title === undefined) {
        siteJson.title = 'UX Library';
    }
    if (siteJson.version === undefined) {
        siteJson.version = '1.0';
    }
    if (siteJson.overviewMarkdownFile === undefined) {
        siteJson.overviewMarkdownFile = siteJson.scssPath + '/documentation/styleguide.md';
    }
    if (siteJson.targetPath === undefined) {
        siteJson.targetPath = 'www/styleguide';
    }
    if (siteJson.examplePagesSourcePath === undefined) {
        siteJson.examplePagesSourcePath = 'src/html/pages';
    }
    if (siteJson.examplePagesTargetPath === undefined) {
        siteJson.examplePagesTargetPath = 'www/examples';
    }
    if (siteJson.assetPath === undefined) {
        siteJson.assetPath = 'src/assets';
    }
    if (siteJson.imagePath === undefined) {
        siteJson.imagePath = 'src/img';
    }
    if (siteJson.scssPath === undefined) {
        siteJson.scssPath = 'src/scss';
    }
    if (siteJson.componentPath === undefined) {
        siteJson.componentPath = 'src/scss/init-uxhub';
    }
    if (siteJson.templateName === undefined) {
        siteJson.templateName = 'style-guide-layout.hbs';
    }
    if (siteJson.templateNameIframe === undefined) {
        siteJson.templateNameIframe = 'iframe-content.hbs';
    }
    if (siteJson.alternativeTemplateNameIframe === undefined) {
        siteJson.alternativeTemplateNameIframe = 'alternative-iframe-content.hbs';
    }
    if (siteJson.templateNameIframe === undefined) {
        siteJson.templateNameIframe = 'iframe-content.hbs';
    }
    if (siteJson.alternative2TemplateNameIframe === undefined) {
        siteJson.alternative2TemplateNameIframe = 'alternative-iframe-content2.hbs';
    }
    if (siteJson.gitlabStemUrl === undefined) {
        siteJson.gitlabStemUrl = 'Please set gitlabStemUrl in site.json';
    }
    return siteJson;
}
exports.parseSiteJson = parseSiteJson;
function setupContent(app) {
    // generating file for search
    var siteData = parseSiteJson();
    var componentPath = siteData.componentPath;
    // setup the uxLibrary pages
    var foundComments = typeScriptCommentsFinder_1.findCommentsInDirectory(componentPath, '*.scss', '');
    var uxSections = typeScriptCommentsParser_1.convertKccCommentsToSectionObjects(foundComments);
    var overviewMarkdownFile = siteData.overviewMarkdownFile;
    var sections = {};
    // in addition to the pages generated from the KSS comments create an index / overview page
    var indexPage = {
        sectionName: "index",
        sectionTitle: "Overview",
        description: "No overview Markdown file found",
        srcPath: null,
        level: 1
    };
    if (fs.existsSync(overviewMarkdownFile)) {
        var overviewFileContents = fs.readFileSync(overviewMarkdownFile);
        indexPage.description = overviewFileContents.toString();
        indexPage.srcPath = overviewMarkdownFile;
    }
    // add overview as first
    sections["index"] = indexPage;
    // append to sections (overview on top)
    _.extend(sections, uxSections);
    var navBarItems = getListOfNavBarItems(sections);
    for (var sectionKey in sections) {
        var section = sections[sectionKey];
        if (sectionKey === 'index') {
            // create html file for the index page
            createHtmlFileForSection(section, sectionKey, navBarItems, sectionKey, siteData, app);
        }
        else if (typeof (section) === 'object' && section.sectionName !== undefined) {
            // now only create pages for each second level page (e.g. not for first level like Building Blocks
            // but for second level like Entry Field (each control on a separate page)
            for (var subSectionKey in section) {
                var subSection = section[subSectionKey];
                if (typeof (subSection) === 'object' && subSection.sectionName !== undefined) {
                    createHtmlFileForSection(subSection, subSectionKey, navBarItems, sectionKey, siteData, app);
                }
            }
        }
    }
    // write a file containing all sections and their data. This file is used by the search.
    if (siteData.targetPath !== undefined) {
        fsExtra.outputFileSync(siteData.targetPath + '/data/search-index.json', JSON.stringify(sections, null, 4));
    }
    else {
        console.error('Please specify the targetPath in your site.json.');
    }
    return siteData;
}
exports.setupContent = setupContent;
function getListOfNavBarItems(sections) {
    var navBarItems = {};
    for (var sectionKey in sections) {
        var section = sections[sectionKey];
        var subSections = [];
        if (isSection(section)) {
            var firstLevelNavItem = {
                sectionName: section.sectionName,
                sectionTitle: section.sectionTitle,
                level: section.level,
                subSections: subSections
            };
            for (var subSectionKey in section) {
                var subSection = section[subSectionKey];
                if (isSection(subSection) && subSection.level === 2) {
                    var secondLevelNavItem = {
                        sectionName: subSection.sectionName,
                        sectionTitle: subSection.sectionTitle,
                        level: subSection.level
                    };
                    firstLevelNavItem.subSections.push(secondLevelNavItem);
                }
            }
            // sort subsections alphabetically
            sortAlphabetically(firstLevelNavItem.subSections);
            navBarItems[sectionKey] = firstLevelNavItem;
        }
    }
    return navBarItems;
}
exports.getListOfNavBarItems = getListOfNavBarItems;
function isSection(object) {
    return typeof (object) === 'object' && object.sectionName !== undefined;
}
exports.isSection = isSection;
/**
 * Sort sections object by alphabet
 */
function sortAlphabetically(dict) {
    // sort array by alphabet
    dict.sort(function (a, b) {
        if (a.sectionName.toLowerCase() < b.sectionName.toLowerCase()) {
            return -1;
        }
        else if (a.sectionName.toLowerCase() > b.sectionName.toLowerCase()) {
            return 1;
        }
        else {
            return 0;
        }
    });
}
exports.sortAlphabetically = sortAlphabetically;
/**
 * Creates an html file for the given section.
 * @param sectionData The data specific to the section that is written to an html file.
 * @param sectionName The name of the section that is written to an html file.
 * @param allSections The array containing all sections (not only the current section and its subsections) This is necessary to create
 * the navigation bar.
 * @param parentSectionName The name of the parent section. Necessary to detect which navigation item must be active when this page
 * is displayed.
 * @param siteData Contents of the site.json file.
 * @param app The assemble app
 */
function createHtmlFileForSection(sectionData, sectionName, navBarItems, parentSectionName, siteData, app) {
    'use strict';
    var filePath;
    if (sectionName !== 'index') {
        filePath = '/overview-' + sectionName.toLowerCase() + '.html';
    }
    else {
        filePath = '/' + sectionName.toLowerCase() + '.html';
    }
    var buildDate = formattedDateAsString(new Date());
    var indexPageTemplateName = siteData.templateName;
    var currentPage = {
        data: {
            layout: indexPageTemplateName,
            navBarItems: null,
            subSections: null,
            parentSectionName: null,
            srcPath: null,
        },
        dest: siteData.targetPath + filePath
    };
    // add build date to data so that it
    // can be displayed in the styleguide
    sectionData.buildDate = buildDate;
    //merge the page data into the context
    currentPage.data = _.merge(currentPage.data, sectionData);
    currentPage.data.navBarItems = navBarItems;
    currentPage.data.subSections = sectionData;
    currentPage.data.parentSectionName = parentSectionName;
    var generate = true;
    //check if modified TODO: options.onlyModified &&
    if (fs.existsSync(currentPage.dest) && currentPage.data.srcPath && fs.existsSync(currentPage.data.srcPath)) {
        var sourceStats = fs.statSync(currentPage.data.srcPath);
        var destStats = fs.statSync(currentPage.dest);
        if (sourceStats.mtime <= destStats.mtime) {
            generate = false;
        }
    }
    if (generate) {
        app.uxLibraryElement(currentPage.dest, {
            content: '',
            data: currentPage.data
        });
        if (siteData.templateNameIframe !== undefined) {
            // only generate html files for iframes if iframe layout specified
            createHtmlIframeFilesForSection(sectionName, sectionData, siteData, app);
        }
    }
}
exports.createHtmlFileForSection = createHtmlFileForSection;
/**
 * In order to render the styleguide examples in an iframe they must be written
 * to separate html files. This means each section and subsection must be in its
 * own html file. This method generates the necessary html files recursively for
 * all subsections (and nested subsections) for the given section.
 * @param sectionKey The key of the section that should be written to an html file (as well as its subsections)
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param siteData The site.json file contents.
 * @param app The assemble app object.
 */
function createHtmlIframeFilesForSection(sectionKey, section, siteData, app) {
    'use strict';
    // index page does not need to
    // be rendered in an iframe
    if (sectionKey !== 'index') {
        // create html file for the given section
        var firstPage = {
            data: {
                layout: siteData.templateNameIframe,
                navBarItems: null,
                subSections: null,
                parentSectionName: null,
                srcPath: null,
            },
            dest: siteData.targetPath + section.htmlFile,
        };
        var alternativePage = void 0;
        if (section.alternativeMarkup) {
            alternativePage = {
                data: {
                    layout: siteData.alternativeTemplateNameIframe,
                    navBarItems: null,
                    subSections: null,
                    parentSectionName: null,
                    srcPath: null,
                },
                dest: siteData.targetPath + section.alternativeHtmlFile,
            };
            alternativePage.data = _.merge(alternativePage.data, section);
        }
        var alternative2Page = void 0;
        if (section.alternative2Markup) {
            alternative2Page = {
                data: {
                    layout: siteData.alternative2TemplateNameIframe,
                    navBarItems: null,
                    subSections: null,
                    parentSectionName: null,
                    srcPath: null,
                },
                dest: siteData.targetPath + section.alternative2HtmlFile,
            };
            alternative2Page.data = _.merge(alternative2Page.data, section);
        }
        // merge the page data into the context
        firstPage.data = _.merge(firstPage.data, section);
        app.uxLibraryElement(firstPage.dest, {
            content: '',
            data: firstPage.data
        });
        if (section.alternativeMarkup) {
            app.uxLibraryElement(alternativePage.dest, {
                content: '',
                data: alternativePage.data
            });
        }
        if (section.alternative2Markup) {
            app.uxLibraryElement(alternative2Page.dest, {
                content: '',
                data: alternative2Page.data
            });
        }
        // recursively create html files for all subsections
        createHtmlIframeFilesForSubsections(section, siteData, app);
    }
}
exports.createHtmlIframeFilesForSection = createHtmlIframeFilesForSection;
/**
 * Recursive function that creates html files for each of the given sections subsections.
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param siteData The site.json file contents.
 * @param app The assemble app object.
 */
function createHtmlIframeFilesForSubsections(section, siteData, app) {
    'use strict';
    for (var subSectionKey in section) {
        var subSection = section[subSectionKey];
        // Iterate over all properties of a section object. Subsections are stored under their
        // name. Therefore the only way to find out if the current property contains a section
        // is to check if its an object and has a property 'sectionName'.
        if (typeof (subSection) === 'object' && subSection.sectionName !== undefined) {
            // generate an html page for the current subsection
            var subSectionPage = {
                data: {
                    layout: siteData.templateNameIframe
                },
                dest: siteData.targetPath + subSection.htmlFile,
            };
            var alternativeSubSectionPage = void 0;
            if (subSection.alternativeMarkup) {
                alternativeSubSectionPage = {
                    data: {
                        layout: siteData.alternativeTemplateNameIframe
                    },
                    dest: siteData.targetPath + subSection.alternativeHtmlFile,
                };
                alternativeSubSectionPage.data = _.merge(alternativeSubSectionPage.data, subSection);
            }
            var alternative2SubSectionPage = void 0;
            if (subSection.alternative2Markup) {
                alternative2SubSectionPage = {
                    data: {
                        layout: siteData.alternative2TemplateNameIframe
                    },
                    dest: siteData.targetPath + subSection.alternative2HtmlFile,
                };
                alternative2SubSectionPage.data = _.merge(alternative2SubSectionPage.data, subSection);
            }
            // merge the page data into the context
            subSectionPage.data = _.merge(subSectionPage.data, subSection);
            app.uxLibraryElement(subSectionPage.dest, {
                content: '',
                data: subSectionPage.data
            });
            if (subSection.alternativeMarkup) {
                app.uxLibraryElement(alternativeSubSectionPage.dest, {
                    content: '',
                    data: alternativeSubSectionPage.data
                });
            }
            if (subSection.alternative2Markup) {
                app.uxLibraryElement(alternative2SubSectionPage.dest, {
                    content: '',
                    data: alternative2SubSectionPage.data
                });
            }
            // recursively create html files for all subsections
            createHtmlIframeFilesForSubsections(subSection, siteData, app);
        }
    }
}
exports.createHtmlIframeFilesForSubsections = createHtmlIframeFilesForSubsections;
/**
 * Get a formatted date string from the given date
 * in a german date format (e.g.: '01.01.1970').
 */
function formattedDateAsString(date) {
    var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
}
exports.formattedDateAsString = formattedDateAsString;
//# sourceMappingURL=setupContent.js.map