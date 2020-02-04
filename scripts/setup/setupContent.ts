import Assemble from 'assemble';

import * as colors from 'colors/safe';

import { UxLibraryConfig, Section } from '../typings';

import { merge , extend } from 'lodash';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';

import { findCommentsInDirectory } from '../finderParser/commentsFinder';
import { convertKccCommentsToSectionObjects } from '../finderParser/commentsParser';

export function parseSiteJson(projectRootFolder: string, configFilePath: string): UxLibraryConfig {
  const siteJsonFilePath = `${projectRootFolder}/${configFilePath}`;
  console.info(`Loading configuration from: ${colors.blue(siteJsonFilePath)}`);
  console.info(colors.grey(`To load from alternate locations use the '--config' and '--rootFolder' parameters`));
  const siteJsonContent = fs.readFileSync(siteJsonFilePath);
  const uxLibraryConfig: UxLibraryConfig = JSON.parse(siteJsonContent.toString());
  console.info(`Loaded Config:`);
  console.dir(uxLibraryConfig);
  console.info(``);

  // set default values
  if (uxLibraryConfig.title === undefined) {
    uxLibraryConfig.title = 'UX Library';
  }
  if (uxLibraryConfig.version === undefined) {
    uxLibraryConfig.version = '1.0';
  }
  if (uxLibraryConfig.scssPath === undefined) {
    uxLibraryConfig.scssPath = `${projectRootFolder}/src/scss`;
  } else {
    uxLibraryConfig.scssPath = projectRootFolder + '/' + uxLibraryConfig.scssPath;
  }
  if (uxLibraryConfig.overviewMarkdownFile === undefined) {
    uxLibraryConfig.overviewMarkdownFile = uxLibraryConfig.scssPath + '/documentation/styleguide.md';
  }
  if (uxLibraryConfig.targetPath === undefined) {
    uxLibraryConfig.targetPath = `${projectRootFolder}/www/styleguide`;
  } else {
    uxLibraryConfig.targetPath = projectRootFolder + '/' + uxLibraryConfig.targetPath;
  }
  if (uxLibraryConfig.examplePagesSourcePath === undefined) {
    uxLibraryConfig.examplePagesSourcePath = `${projectRootFolder}/src/html/pages`;
  } else {
    uxLibraryConfig.examplePagesSourcePath = projectRootFolder + '/' + uxLibraryConfig.examplePagesSourcePath;
  }
  if (uxLibraryConfig.dataFilesPath === undefined) {
    uxLibraryConfig.dataFilesPath = `${projectRootFolder}/src/ux-library/data`;
  } else {
    uxLibraryConfig.dataFilesPath = projectRootFolder + '/' + uxLibraryConfig.dataFilesPath;
  }
  if (uxLibraryConfig.partialsPath === undefined) {
    uxLibraryConfig.partialsPath = `${projectRootFolder}/src/ux-library/layouts`;
  } else {
    uxLibraryConfig.partialsPath = projectRootFolder + '/' + uxLibraryConfig.partialsPath;
  }
  if (uxLibraryConfig.layoutsPath === undefined) {
    uxLibraryConfig.layoutsPath = `${projectRootFolder}/src/ux-library/layouts`;
  } else {
    uxLibraryConfig.layoutsPath = projectRootFolder + '/' + uxLibraryConfig.layoutsPath;
  }
  if (uxLibraryConfig.examplePagesTargetPath === undefined) {
    uxLibraryConfig.examplePagesTargetPath = `${projectRootFolder}/www/examples`;
  } else {
    uxLibraryConfig.examplePagesTargetPath = projectRootFolder + '/' + uxLibraryConfig.examplePagesTargetPath;
  }
  if (uxLibraryConfig.assetSourcePath === undefined) {
    uxLibraryConfig.assetSourcePath = `${projectRootFolder}/src/assets`;
  } else if (uxLibraryConfig.assetSourcePath !== null){
    uxLibraryConfig.assetSourcePath = projectRootFolder + '/' + uxLibraryConfig.assetSourcePath;
  }
  if (uxLibraryConfig.assetTargetPath === undefined) {
    uxLibraryConfig.assetTargetPath = `assets`;
  }
  if (uxLibraryConfig.imagePath === undefined) {
    uxLibraryConfig.imagePath = `${projectRootFolder}/src/img`;
  } else {
    uxLibraryConfig.imagePath = projectRootFolder + '/' + uxLibraryConfig.imagePath;
  }

  if (uxLibraryConfig.componentPath === undefined) {
    uxLibraryConfig.componentPath = `${projectRootFolder}/src/scss`;
  } else {
    uxLibraryConfig.componentPath = projectRootFolder + '/' + uxLibraryConfig.componentPath;
  }

  // Handlebars helpers - used to load additional handlebars helpers
  if (uxLibraryConfig.additionalHandlebarsHelpersPath === undefined) {
    uxLibraryConfig.additionalHandlebarsHelpersPath = `${projectRootFolder}/src/ux-library/handlebars-helpers`;
  } else {
    uxLibraryConfig.additionalHandlebarsHelpersPath = projectRootFolder + '/' + uxLibraryConfig.additionalHandlebarsHelpersPath;
  }
  if (uxLibraryConfig.templateName === undefined) {
    uxLibraryConfig.templateName = 'style-guide-layout.hbs';
  }
  if (uxLibraryConfig.gitlabStemUrl === undefined) {
    uxLibraryConfig.gitlabStemUrl = 'Please set gitlabStemUrl in ux-library-config.json';
  }

  return uxLibraryConfig;
}

export function setupContent(app: Assemble, uxLibraryConfig: UxLibraryConfig) {

  const componentPath = uxLibraryConfig.componentPath;

  // setup the uxLibrary pages
  const foundComments = findCommentsInDirectory(componentPath, '*.scss', '');
  const uxSections = convertKccCommentsToSectionObjects(foundComments);

  const overviewMarkdownFile = uxLibraryConfig.overviewMarkdownFile;
  const sections: Map<string, Section> = new Map();

  // in addition to the pages generated from the KSS comments create an index / overview page
  const indexPage: Section = {
    sectionName: 'index',
    sectionTitle: 'Overview',
    description: 'No overview Markdown file found',
    srcPath: null,
    level: 1
  };

  if (fs.existsSync(overviewMarkdownFile)) {
    const overviewFileContents = fs.readFileSync(overviewMarkdownFile);

    indexPage.description = overviewFileContents.toString();
    indexPage.srcPath = overviewMarkdownFile;
  }
  // add overview as first
  // tslint:disable-next-line:no-string-literal
  sections['index'] = indexPage;

  // append to sections (overview on top)
  extend(sections, uxSections);

  const navBarItems = getListOfNavBarItems(sections);

  for (const sectionKey in sections) {
    if (sections.hasOwnProperty(sectionKey)) {
      const section = sections[sectionKey];

      if (sectionKey === 'index') {

        // create html file for the index page
        createHtmlFileForSection(section, sectionKey, navBarItems, sectionKey, uxLibraryConfig, app);
      } else if (typeof (section) === 'object' && section.sectionName !== undefined) {
        // now only create pages for each second level page (e.g. not for first level like Building Blocks
        // but for second level like Entry Field (each control on a separate page)
        for (const subSectionKey in section) {
          if (section.hasOwnProperty(subSectionKey)) {
            const subSection = section[subSectionKey];
            if (typeof (subSection) === 'object' && subSection.sectionName !== undefined) {
              createHtmlFileForSection(subSection, subSectionKey, navBarItems, sectionKey, uxLibraryConfig, app);
            }
          }
        }
      }
    }
  }

  // write a file containing all sections and their data. This file is used by the search.
  if (uxLibraryConfig.targetPath !== undefined) {
    fsExtra.outputFileSync(uxLibraryConfig.targetPath + '/data/search-index.json', JSON.stringify(sections, null, 4));
  } else {
    console.error('Please specify the targetPath in your site.json.');
  }

  return uxLibraryConfig;
}

export function getListOfNavBarItems(sections) {
  const navBarItems = {};

  for (const sectionKey in sections) {
    if (sections.hasOwnProperty(sectionKey)) {
      const section = sections[sectionKey];
      const subSections = [];

      if (isSection(section)) {
        const firstLevelNavItem = {
          sectionName: section.sectionName,
          sectionTitle: section.sectionTitle,
          level: section.level,
          subSections
        };

        for (const subSectionKey in section) {
          if (section.hasOwnProperty(subSectionKey)) {
            const subSection = section[subSectionKey];

            if (subSection != null && isSection(subSection) && subSection.level === 2) {
              const secondLevelNavItem = {
                sectionName: subSection.sectionName,
                sectionTitle: subSection.sectionTitle,
                level: subSection.level
              };

              firstLevelNavItem.subSections.push(secondLevelNavItem);
            }
          }
        }
        // sort subsections alphabetically
        sortAlphabetically(firstLevelNavItem.subSections);

        navBarItems[sectionKey] = firstLevelNavItem;
      }
    }
  }
  return navBarItems;
}

export function isSection(object) {
  return typeof (object) === 'object' && object.sectionName !== undefined;
}

/**
 * Sort sections object by alphabet
 */
export function sortAlphabetically(dict) {
  // sort array by alphabet
  dict.sort((a, b) => {
    if (a.sectionName.toLowerCase() < b.sectionName.toLowerCase()) {
      return -1;
    } else if (a.sectionName.toLowerCase() > b.sectionName.toLowerCase()) {
      return 1;
    } else {
      return 0;
    }
  });
}

/**
 * Creates an html file for the given section.
 * @param sectionData The data specific to the section that is written to an html file.
 * @param sectionName The name of the section that is written to an html file.
 * @param allSections The array containing all sections (not only the current section and its subsections) This is necessary to create
 * the navigation bar.
 * @param parentSectionName The name of the parent section. Necessary to detect which navigation item must be active when this page
 * is displayed.
 * @param uxLibraryConfig Contents of the site.json file.
 * @param app The assemble app
 */
export function createHtmlFileForSection(sectionData, sectionName, navBarItems, parentSectionName, uxLibraryConfig: UxLibraryConfig, app) {
  'use strict';
  let filePath;

  if (sectionName !== 'index') {
    filePath = '/overview-' + sectionName.toLowerCase() + '.html';
  } else {
    filePath = '/' + sectionName.toLowerCase() + '.html';
  }

  const buildDate = formattedDateAsString(new Date());

  const indexPageTemplateName = uxLibraryConfig.templateName;
  const currentPage = {
    data: {
      layout: indexPageTemplateName,
      navBarItems: null,
      subSections: null,
      parentSectionName: null,
      srcPath: null
    },
    dest: uxLibraryConfig.targetPath + filePath
  };

  // add build date to data so that it
  // can be displayed in the styleguide
  sectionData.buildDate = buildDate;

  // merge the page data into the context
  currentPage.data = merge(currentPage.data, sectionData);
  currentPage.data.navBarItems = navBarItems;
  currentPage.data.subSections = sectionData;
  currentPage.data.parentSectionName = parentSectionName;

  let generate = true;
  // check if modified TODO: options.onlyModified &&
  if (fs.existsSync(currentPage.dest) && currentPage.data.srcPath && fs.existsSync(currentPage.data.srcPath)) {
    const sourceStats = fs.statSync(currentPage.data.srcPath);
    const destStats = fs.statSync(currentPage.dest);
    if (uxLibraryConfig.enableDeltaUpdates && sourceStats.mtime <= destStats.mtime) {
      generate = false;
    }
  }

  if (generate) {
    app.uxLibraryElement(currentPage.dest, {
      content: '',
      data: currentPage.data,
      page: currentPage.data
    }
    );

    if (uxLibraryConfig.templateNameIframe !== undefined) {
      // only generate html files for iFrames if iframe layout specified
      createHtmlIframeFilesForSection(sectionName, sectionData, uxLibraryConfig, app);
    }
  }
}

/**
 * In order to render the styleguide examples in an iframe they must be written
 * to separate html files. This means each section and subsection must be in its
 * own html file. This method generates the necessary html files recursively for
 * all subsections (and nested subsections) for the given section.
 * @param sectionKey The key of the section that should be written to an html file (as well as its subsections)
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param uxLibraryConfig The site.json file contents.
 * @param app The assemble app object.
 */
export function createHtmlIframeFilesForSection(sectionKey, section, uxLibraryConfig: UxLibraryConfig, app) {
  'use strict';

  // index page does not need to
  // be rendered in an iframe
  if (sectionKey !== 'index') {

    // create html file for the given section
    const firstPage = {
      data: {
        layout: uxLibraryConfig.templateNameIframe,
        navBarItems: null,
        subSections: null,
        parentSectionName: null,
        srcPath: null
      },
      dest: uxLibraryConfig.targetPath + section.htmlFile
    };

    let alternativePage;
    if (section.alternativeMarkup) {
      alternativePage = {
        data: {
          layout: uxLibraryConfig.alternativeTemplateNameIframe,
          navBarItems: null,
          subSections: null,
          parentSectionName: null,
          srcPath: null
        },
        dest: uxLibraryConfig.targetPath + section.alternativeHtmlFile
      };
      alternativePage.data = merge(alternativePage.data, section);
    }

    let alternative2Page;
    if (section.alternative2Markup) {
      alternative2Page = {
        data: {
          layout: uxLibraryConfig.alternative2TemplateNameIframe,
          navBarItems: null,
          subSections: null,
          parentSectionName: null,
          srcPath: null
        },
        dest: uxLibraryConfig.targetPath + section.alternative2HtmlFile
      };
      alternative2Page.data = merge(alternative2Page.data, section);
    }

    // merge the page data into the context
    firstPage.data = merge(firstPage.data, section);

    app.uxLibraryElement(firstPage.dest, {
      content: '',
      data: firstPage.data
    }
    );

    if (section.alternativeMarkup) {
      app.uxLibraryElement(alternativePage.dest, {
        content: '',
        data: alternativePage.data
      }
      );
    }

    if (section.alternative2Markup) {
      app.uxLibraryElement(alternative2Page.dest, {
        content: '',
        data: alternative2Page.data
      }
      );
    }

    // recursively create html files for all subsections
    createHtmlIframeFilesForSubsections(section, uxLibraryConfig, app);
  }
}

/**
 * Recursive function that creates html files for each of the given sections subsections.
 * @param section The section that should be written to an html file (as well as its subsections)
 * @param uxLibraryConfig The site.json file contents.
 * @param app The assemble app object.
 */
export function createHtmlIframeFilesForSubsections(section, uxLibraryConfig: UxLibraryConfig, app) {
  'use strict';

  for (const subSectionKey in section) {
    if (section.hasOwnProperty(subSectionKey)) {
      const subSection = section[subSectionKey];

      // Iterate over all properties of a section object. Subsections are stored under their
      // name. Therefore the only way to find out if the current property contains a section
      // is to check if its an object and has a property 'sectionName'.
      if (typeof (subSection) === 'object' && subSection.sectionName !== undefined) {

        // generate an html page for the current subsection
        const subSectionPage = {
          data: {
            layout: uxLibraryConfig.templateNameIframe
          },
          dest: uxLibraryConfig.targetPath + subSection.htmlFile
        };

        let alternativeSubSectionPage;
        if (subSection.alternativeMarkup) {
          alternativeSubSectionPage = {
            data: {
              layout: uxLibraryConfig.alternativeTemplateNameIframe
            },
            dest: uxLibraryConfig.targetPath + subSection.alternativeHtmlFile
          };
          alternativeSubSectionPage.data = merge(alternativeSubSectionPage.data, subSection);
        }

        let alternative2SubSectionPage;
        if (subSection.alternative2Markup) {
          alternative2SubSectionPage = {
            data: {
              layout: uxLibraryConfig.alternative2TemplateNameIframe
            },
            dest: uxLibraryConfig.targetPath + subSection.alternative2HtmlFile
          };
          alternative2SubSectionPage.data = merge(alternative2SubSectionPage.data, subSection);
        }

        // merge the page data into the context
        subSectionPage.data = merge(subSectionPage.data, subSection);

        app.uxLibraryElement(subSectionPage.dest, {
          content: '',
          data: subSectionPage.data
        }
        );

        if (subSection.alternativeMarkup) {
          app.uxLibraryElement(alternativeSubSectionPage.dest, {
            content: '',
            data: alternativeSubSectionPage.data
          }
          );
        }

        if (subSection.alternative2Markup) {
          app.uxLibraryElement(alternative2SubSectionPage.dest, {
            content: '',
            data: alternative2SubSectionPage.data
          }
          );
        }

        // recursively create html files for all subsections
        createHtmlIframeFilesForSubsections(subSection, uxLibraryConfig, app);
      }
    }
  }
}

/**
 * Get a formatted date string from the given date
 * in a german date format (e.g.: '01.01.1970').
 */
export function formattedDateAsString(date) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

  return date.toLocaleDateString('de-DE', options);
}
