import { join } from 'path';
import * as fs from 'fs';

const sectionRegex = /styleguide\s.*(?=\n)/i;
const startCommentRegex = /\/\*.*\n?/;
const endCommentRegex = /\n\*\/.*\n?/;

export function addSubSectionsToObject(subSections, parentSection, pathToRootSection, baseHtmlFileName, sectionRefs) {
  if (pathToRootSection === null || pathToRootSection === undefined) {
    pathToRootSection = '';
  }

  if (sectionRefs === null || sectionRefs === undefined) {
    sectionRefs = [];
  }

  // test Hack.Hack.Hack
  if (/Hack/.test(subSections[0].trim())) {
    return;
  }
  // check that the section name is valid
  if (subSections[0].length === 0 || subSections[0] === '') {
    return parentSection;
  }

  if (parentSection.sectionTitle !== null && parentSection.sectionTitle !== undefined) {
    // Add the current sections title to the sectionRefs array that holds all section titles
    // up to the root. This is necessary to display the path to the current component in the
    // search results.
    sectionRefs.push(parentSection.sectionTitle);
  }

  // the name of the current section
  // e.g. when the path is: some.path.xyz
  // then the currentName is 'some'
  const currentSectionName = subSections[0].trim();

  // replace whitespace in file names with a dash
  const currentSectionNameWithoutWhitespace = currentSectionName.replace(/ /g, '-');

  if (parentSection.level === 1) {
    if (baseHtmlFileName === null || baseHtmlFileName === undefined) {
      baseHtmlFileName = currentSectionNameWithoutWhitespace + '.html';
    }
  }

  // check if this section name already exists before creating
  if (!parentSection[currentSectionNameWithoutWhitespace]) {
    let htmlFilePath;
    let alternativeHtmlFilePath;
    let alternative2HtmlFilePath;
    let destinationPath;
    let sectionRef = 'sectionRef';

    // create a unique identifier for the section. This is possible by appending the names of all
    // parent sections plus the name of the current section.
    for (const eachSectionRef of sectionRefs) {
      sectionRef = sectionRef + '-' + eachSectionRef.trim()
        .replace(/ /g, '-')
        .toLowerCase();
    }
    sectionRef = sectionRef + '-' + currentSectionNameWithoutWhitespace;

    if (parentSection.level === 1) {
      // this section is the top level section
      // therefore give the html file the same name as the section
      // example: sectionabc-test/sectionabc-test.html
      htmlFilePath = currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternativeHtmlFilePath = 'alternative-' + currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternative2HtmlFilePath = 'alternative2-' + currentSectionNameWithoutWhitespace + '_' + currentSectionNameWithoutWhitespace + '.html';
      destinationPath = './' + 'overview-' + currentSectionNameWithoutWhitespace.replace(/\//, '') + '.html';

    } else if (parentSection.level > 1) {
      // otherwise the path for the html file is relative from the root section
      // example: sectionabc-test/some-sub-section/someFinalSection.html
      htmlFilePath = pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternativeHtmlFilePath = 'alternative-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
      alternative2HtmlFilePath = 'alternative2-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';

      destinationPath = './' + 'overview-' + baseHtmlFileName.replace(/\//, '') + '#' + sectionRef;
    }

    const newSection = {
      sectionName: currentSectionNameWithoutWhitespace,
      level: parentSection.level + 1,
      htmlFile: htmlFilePath,
      alternativeHtmlFile: alternativeHtmlFilePath,
      alternative2HtmlFile: alternative2HtmlFilePath,
      sectionLocation: sectionRefs,
      sectionRef,
      destPath: destinationPath
    };
    parentSection[currentSectionNameWithoutWhitespace] = newSection;
    if (!parentSection.subSections) {
      parentSection.subSections = {};
    }
    if (!parentSection.subSections[currentSectionNameWithoutWhitespace]) {
      parentSection.subSections[currentSectionNameWithoutWhitespace] = newSection;
    }
  }

  // save the path to the root section and pass it to recursive function calls
  if (pathToRootSection === '') {
    // first section
    pathToRootSection = currentSectionNameWithoutWhitespace;
  } else {
    // all subsequent sections must be separated by a slash
    pathToRootSection = pathToRootSection + '_' + currentSectionNameWithoutWhitespace;
  }

  // load this section
  const currentSection = parentSection[currentSectionNameWithoutWhitespace];
  // go deeper if required
  if (subSections.length > 1) {
    const remainingSections = subSections.slice(1);
    return addSubSectionsToObject(remainingSections, currentSection, pathToRootSection, baseHtmlFileName, sectionRefs);
  }

  // return this section if there are no children.
  return currentSection;
}

/**
 * split variation string in name and description
 * @param: variations array with string
 * @return Array object {name, description}
 */
export function splitvariations(variations) {

  const returnArray = [];

  variations.forEach((variation) => {

    let vName;
    let vDescription;

    // match until " -"
    const classes = variation.match(/(?:(?!\s\-).)*/i);
    if (classes !== null && classes.length > 0) {
      vName = classes[0];
      vName = vName.trim();
    } else {
      return;
    }

    // get description
    vDescription = variation.replace(vName, '');

    if (!vDescription) {
      vDescription = '';
    }
    vDescription = vDescription.replace('-', '')
      .trim();

    // create class(es)
    let vClass = vName.replace(/\./g, ' ')
      .trim();

    // his is a variation and should return the pseudo-classes
    vClass = vClass.replace(/:/, ' pseudo-class-')
      .trim();

    returnArray.push({
      variationName: vName,
      variationDescription: vDescription,
      variationClass: vClass.split(' ')
    });
  });

  return returnArray;
}

/**
 * split property line into property object of
 * propertyName
 * propertyValue or propertyValues as [] separated by ,
 */
export function addPropertyObject(el, properties) {

  const nameValue = el.split(':');

  if (nameValue[0] && nameValue[1]) {

    // use lowercase of name
    const name = nameValue[0].toLowerCase();

    // get values
    const values = nameValue[1].split(',');

    // values seperated by ","
    if (values.length > 0) {
      for (let i = 0; i < values.length; i++) {
        values[i] = values[i].trim();
      }
      properties[name.trim()] = values;
    }
  }
}

function _getJSONPath(markup, srcPath) {

  let mName = markup.split('.')
    .slice(0, -1)
    .join('.'); // remove extension
  mName = mName.replace(/\s*/, '');   //  remove spaces
  const dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
  // const path = dirname + "/" + mName + ".json";
  mName += '.json';

  return join(dirname, mName);
}

function cleanUpComment(inputComment) {
  let outputComment = inputComment;
  outputComment = outputComment.replace(startCommentRegex, '');
  outputComment = outputComment.replace(endCommentRegex, '');
  return outputComment;
}

export function getSectionObjectOfComment(cssCommentPathObject, sections) {

  let cssComment = cssCommentPathObject.comment;
  const srcPath = cssCommentPathObject.srcPath;

  // check if it is a KSS comment block
  if (sectionRegex.test(cssComment)) {

    // strip out the start and end comment markers
    cssComment = cleanUpComment(cssComment);

    // put the comment lines in an array
    let cssLines = cssComment.split('\n');

    // use last line as the style information and remove from the array
    let sectionData = cssLines.pop();
    sectionData = sectionData.replace(/styleguide\s/i, '')
      .toLowerCase();

    // create a section object and any required parent objects
    const sectionObject = addSubSectionsToObject(sectionData.split('.'), sections, null, null, null);

    // if a section can't be created from this comment then it will be null - therefore skip this comment
    if (!sectionObject) {
      return -1;
    }
    // set the source path
    sectionObject.srcPath = srcPath;

    // take the title from the first line and removes from array
    const sectionTitle = cssLines.shift()
      .trim();
    sectionObject.sectionTitle = sectionTitle;

    // test if array have more lines
    if (cssLines.length <= 0) {
      return sectionObject;
    }

    // remove empty first and last lines
    if (cssLines[0].length === 0) {
      cssLines.shift();
    }
    if (cssLines.length > 0 && cssLines[cssLines.length - 1].length === 0) {
      cssLines.pop();
    }

    // check if the comment contains markup
    let markupCommentIndex = -1;
    const commentContainsMarkup = cssLines.some((element, index) => {
      const markupTest = new RegExp('markup:', 'i').test(element);
      if (markupTest) {
        markupCommentIndex = index;
        return true;
      }
      return false;
    });

    // check if the comment contains alternative markup
    let alternativeMarkup;
    const commentContainsAlternativeMarkup = cssLines.some((element, index) => {
      const alternativeMarkupTest = new RegExp('alternative-markup:', 'i').test(element);
      if (alternativeMarkupTest) {
        alternativeMarkup = element;
        return true;
      }
      return false;
    });
    let alternativeScss;
    const commentContainsAlternativeScss = cssLines.some((element, index) => {
      const alternativeScssTest = new RegExp('alternative-scss-file:', 'i').test(element);
      if (alternativeScssTest) {
        alternativeScss = element.replace(/alternative-scss-file:/i, '')
          .trim();
        return true;
      }
      return false;
    });
    if (commentContainsAlternativeScss && alternativeScss) {
      const alternativeSrcPath = srcPath.substring(0, srcPath.lastIndexOf('/') + 1);
      sectionObject.alternativeSrcPath = alternativeSrcPath + alternativeScss;
    }

    let alternative2Markup;
    const commentContainsAlternative2Markup = cssLines.some((element, index) => {
      const alternative2MarkupTest = new RegExp('alternative2-markup:', 'i').test(element);
      if (alternative2MarkupTest) {
        alternative2Markup = element;
        return true;
      }
      return false;
    });
    let alternative2Scss;
    const commentContainsAlternative2Scss = cssLines.some((element, index) => {
      const alternative2ScssTest = new RegExp('alternative2-scss-file:', 'i').test(element);
      if (alternative2ScssTest) {
        alternative2Scss = element.replace(/alternative2-scss-file:/i, '').trim();
        return true;
      }
      return false;
    });
    if (commentContainsAlternative2Scss && alternative2Scss) {
      const alternative2SrcPath = srcPath.substring(0, srcPath.lastIndexOf('/') + 1);
      sectionObject.alternative2SrcPath = alternative2SrcPath + alternative2Scss;
    }

    // get the description and remove from the lines
    let descriptionLines = []; // cssLines;
    let descriptionString = '';
    if (commentContainsMarkup) {
      descriptionLines = cssLines.slice(0, markupCommentIndex);
      cssLines = cssLines.slice(markupCommentIndex);
      descriptionString = descriptionLines.join('  \n'); // 2 spaces for a markdown new line ;-)
      descriptionString = descriptionString.replace(/^\s+|\s+$/g, '');
      if (descriptionString !== '') {
        sectionObject.description = descriptionString.trim();
      }
    }

    /**
     * variations block
     */
    // check if variations are available (start with .)
    // get variations
    let variationsIndexStart = -1;
    let variationsIndexEnd = -1;
    const variations = [];
    const commentContainsvariations = cssLines.some((element, index, array) => {
      if (element.search(/^(\.|\:)\w+/i) === 0) {   /* ^\..* */
        // found variations start
        if (variationsIndexStart === -1) {
          variationsIndexStart = index;
        }
        // found variations end
        variationsIndexEnd = index;

        variations.push(element);
      }
      if (index === array.length - 1 && variations.length > 0) {
        return true;
      }
      return false;
    });

    let markupLines;

    // get markup above variations
    // remove variations if available
    // leave properties below variations in cssLines
    if (commentContainsvariations) {
      // TODO if variations without markup are allowed: descriptionLines = cssLines.slice(0, variationsIndexStart);

      // let variationLines = cssLines.slice(variationIndexStart, variationIndexEnd);
      markupLines = cssLines.slice(0, variationsIndexStart);

      cssLines = cssLines.slice(variationsIndexEnd + 1);
      sectionObject.variations = splitvariations(variations);
    }

    /**
     * properties block
     */
    // load further properties
    // check if line starts with 'propertyName:' (but not 'Markup:', 'Angular-Markup:)
    let propertiesIndexStart = -1;
    let propertiesIndexEnd = -1;
    const properties = {};
    const commentContainsProperties = cssLines.some((el, ind, ar) => {
      if (el.search(/^([a-zA-Z0-9_-]+(?=:))(?!::)/gi) === 0) {
        if (el.search(/Markup:/i) !== 0 && el.search(/Angular-Markup:/i) !== 0) {
          if (propertiesIndexStart === -1) {
            propertiesIndexStart = ind;
          }
          propertiesIndexEnd = ind;
          addPropertyObject(el, properties);
        }
      }
      if (ind === ar.length - 1 && /*!_.isEmpty(properties)*/ Object.keys(properties).length !== 0) {
        return true;
      }
      return false;
    });

    if (commentContainsProperties) {
      // if comments contains properties and no markup (assumption: no variations)
      if (!commentContainsMarkup) {
        descriptionLines = cssLines.slice(0, propertiesIndexStart);
        descriptionString = descriptionLines.join('  \n');
        descriptionString = descriptionString.replace(/^\s+|\s+$/g, '');
        if (descriptionString !== '') {
          sectionObject.description = descriptionString.trim();
        }

        // comments contain markup and not already defined by variations
      } else if (!markupLines) {
        markupLines = cssLines.slice(0, propertiesIndexStart);
      }
      cssLines = cssLines.slice(propertiesIndexEnd + 1);
      sectionObject.properties = properties;
    }

    // if comments does not contain markup, variations an no properties
    if (!commentContainsMarkup && !commentContainsProperties && !commentContainsvariations) {
      // no properties and no markup but description
      descriptionLines = cssLines;
      descriptionString = descriptionLines.join('  \n');
      if (descriptionString !== '') {
        sectionObject.description = descriptionString.trim();
      }
      cssLines = [];
    }

    // load the markup
    if (!markupLines) {
      markupLines = cssLines;
    }
    let markup = markupLines.join('\n');

    // test if markup is available
    const markupAvailable = new RegExp('^\s*Markup:\s*', 'i').test(markup);

    let markdownPath;
    let data;
    let alternativePath;
    let alternativeData;
    let alternative2Path;
    let alternative2Data;
    let jsonFileName;
    let alternativeJsonFileName;
    let alternative2JsonFileName;
    if (sectionObject.properties && sectionObject.properties['json-file'] && sectionObject.properties['json-file'][0]) {
      jsonFileName = sectionObject.properties['json-file'][0];
    }
    if (sectionObject.properties && sectionObject.properties['alternative-json-file'] && sectionObject.properties['alternative-json-file'][0]) {
      alternativeJsonFileName = sectionObject.properties['alternative-json-file'][0];
    }
    if (sectionObject.properties && sectionObject.properties['alternative2-json-file'] && sectionObject.properties['alternative2-json-file'][0]) {
      alternative2JsonFileName = sectionObject.properties['alternative2-json-file'][0];
    }
    if (markupAvailable) {
      markup = markup.replace(/^\s*Markup:\s*/i, '');
      sectionObject.markup = markup.trim();

      // if markup from hbs file add data context if available
      if (markup.search(/.*\.hbs/gi) === 0) {

        // let mName = markup.replace(/\.hbs\s*/i, ""); // remove extension
        // mName = mName.replace(/\./, "-");  // remove dots
        // mName = mName.replace(/\s*/, "");   //  remove spaces
        // let dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
        // let path = dirname + "/" + mName + ".json";
        // path = trim();

        // use json file specified by json-file
        if (jsonFileName) {
          markdownPath = _getJSONPath(jsonFileName, srcPath);
        } else {
          markdownPath = _getJSONPath(markup, srcPath);
        }
        if (fs.existsSync(markdownPath)) {
          try {
            const fileContents = fs.readFileSync(markdownPath);
            data = JSON.parse(fileContents.toString());

            // webfont hack
            if (data.hasOwnProperty('cssTemplate') &&
              data.hasOwnProperty('fontBaseName') &&
              (data.hasOwnProperty('engine') && data.engine === 'fontforge') &&
              data.cssTemplate.hasOwnProperty('template')) {
              delete data.cssTemplate.template;
            }
            if (data) {
              sectionObject.markupContext = data;
              sectionObject.markupContextPath = jsonFileName;
            }
          } catch (exception) {
            console.warn(`cannot parse json file (${markdownPath})`);
          }
        }
      }
    }

    if (commentContainsAlternativeMarkup && alternativeMarkup !== undefined) {
      alternativeMarkup = alternativeMarkup.replace(/^\s*alternative-Markup:\s*/i, '');
      sectionObject.alternativeMarkup = alternativeMarkup.trim();

      // if markup from hbs file add data context if available
      if (alternativeMarkup.search(/.*\.hbs/gi) === 0) {

        // use json file specified by json-file
        if (alternativeJsonFileName) {
          alternativePath = _getJSONPath(alternativeJsonFileName, srcPath);
        } else {
          alternativePath = _getJSONPath(alternativeMarkup, srcPath);
        }
        if (fs.existsSync(alternativePath)) {
          try {
            const fileContents = fs.readFileSync(alternativePath);
            alternativeData = JSON.parse(fileContents.toString());

            if (alternativeData) {
              sectionObject.alternativeMarkupContext = alternativeData;
              sectionObject.alternativeMarkupContextPath = alternativeJsonFileName;
            }
          } catch (exception) {
            console.warn(`cannot parse json file (${alternativePath})`);
          }

        }
      }
    }

    if (commentContainsAlternative2Markup && alternative2Markup !== undefined) {
      alternative2Markup = alternative2Markup.replace(/^\s*alternative2-Markup:\s*/i, '');
      sectionObject.alternative2Markup = alternative2Markup.trim();

      // if markup from hbs file add data context if available
      if (alternative2Markup.search(/.*\.hbs/gi) === 0) {

        // use json file specified by json-file
        if (alternative2JsonFileName) {
          alternative2Path = _getJSONPath(alternative2JsonFileName, srcPath);
        } else {
          alternative2Path = _getJSONPath(alternative2Markup, srcPath);
        }
        if (fs.existsSync(alternative2Path)) {
          try {
            const fileContents = fs.readFileSync(alternative2Path);
            alternative2Data = JSON.parse(fileContents.toString());

            if (alternative2Data) {
              sectionObject.alternative2MarkupContext = alternative2Data;
              sectionObject.alternativ2eMarkupContextPath = alternative2JsonFileName;
            }
          } catch (exception) {
            console.warn(`cannot parse json file (${alternative2Path})`);
          }

        }
      }
    }

    return sectionObject;
  }
  return -1;
}

export function convertKccCommentsToSectionObjects(inputComments) {
  const sections = {
    level: 0
  };

  inputComments.forEach((comment) => {
    getSectionObjectOfComment(comment, sections);
  });
  return sections;
}
