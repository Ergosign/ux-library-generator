"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var sectionRegex = /styleguide\s.*(?=\n)/i;
var startCommentRegex = /\/\*.*\n?/;
var endCommentRegex = /\n\*\/.*\n?/;
function addSubSectionsToObject(subSections, parentSection, pathToRootSection, baseHtmlFileName, sectionRefs) {
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
    //check that the section name is valid
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
    var currentSectionName = subSections[0].trim();
    // replace whitespace in file names with a dash
    var currentSectionNameWithoutWhitespace = currentSectionName.replace(/ /g, '-');
    if (parentSection.level === 1) {
        if (baseHtmlFileName === null || baseHtmlFileName === undefined) {
            baseHtmlFileName = currentSectionNameWithoutWhitespace + '.html';
        }
    }
    //check if this section name already exists before creating
    if (!parentSection[subSections[0]]) {
        var htmlFilePath = void 0;
        var alternativeHtmlFilePath = void 0;
        var alternative2HtmlFilePath = void 0;
        var destinationPath = void 0;
        var sectionRef = 'sectionRef';
        // create a unique identifier for the section. This is possible by appending the names of all
        // parent sections plus the name of the current section.
        for (var i = 0; i < sectionRefs.length; i++) {
            sectionRef = sectionRef + '-' + sectionRefs[i].trim()
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
        }
        else if (parentSection.level > 1) {
            // otherwise the path for the html file is relative from the root section
            // example: sectionabc-test/some-sub-section/someFinalSection.html
            htmlFilePath = pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
            alternativeHtmlFilePath = 'alternative-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
            alternative2HtmlFilePath = 'alternative2-' + pathToRootSection + '_' + currentSectionNameWithoutWhitespace + '.html';
            destinationPath = './' + 'overview-' + baseHtmlFileName.replace(/\//, '') + '#' + sectionRef;
        }
        parentSection[currentSectionName] = {
            sectionName: currentSectionName,
            level: parentSection.level + 1,
            htmlFile: htmlFilePath,
            alternativeHtmlFile: alternativeHtmlFilePath,
            alternative2HtmlFile: alternative2HtmlFilePath,
            sectionLocation: sectionRefs,
            sectionRef: sectionRef,
            destPath: destinationPath
        };
    }
    // save the path to the root section and pass it to recursive function calls
    if (pathToRootSection === '') {
        // first section
        pathToRootSection = currentSectionNameWithoutWhitespace;
    }
    else {
        // all subsequent sections must be separated by a slash
        pathToRootSection = pathToRootSection + '_' + currentSectionNameWithoutWhitespace;
    }
    //load this section
    var currentSection = parentSection[currentSectionName];
    //go deeper if required
    if (subSections.length > 1) {
        var remainingSections = subSections.slice(1);
        return addSubSectionsToObject(remainingSections, currentSection, pathToRootSection, baseHtmlFileName, sectionRefs);
    }
    //return this section if there are no children.
    return currentSection;
}
exports.addSubSectionsToObject = addSubSectionsToObject;
/**
 * split letiation string in name and description
 * @param: letiations array with string
 * @return Array object {name, description}
 */
function splitletiations(letiations) {
    var returnArray = [];
    letiations.forEach(function (letiation) {
        var vName;
        var vDescription;
        // match until " -"
        var classes = letiation.match(/(?:(?!\s\-).)*/i);
        if (classes !== null && classes.length > 0) {
            vName = classes[0];
            vName = vName.trim();
        }
        else {
            return;
        }
        // get description
        vDescription = letiation.replace(vName, '');
        if (!vDescription) {
            vDescription = '';
        }
        vDescription = vDescription.replace('-', '')
            .trim();
        // create class(es)
        var vClass = vName.replace(/\./g, ' ')
            .trim();
        // his is a letiation and should return the pseudo-classes
        vClass = vClass.replace(/:/, ' pseudo-class-')
            .trim();
        returnArray.push({
            letiationName: vName,
            letiationDescription: vDescription,
            letiationClass: vClass.split(' ')
        });
    });
    return returnArray;
}
exports.splitletiations = splitletiations;
/**
 * split property line into property object of
 * propertyName
 * propertyValue or propertyValues as [] sperated by ,
 */
function addPropertyObject(el, properties) {
    var nameValue = el.split(':');
    if (nameValue[0] && nameValue[1]) {
        // use lowercase of name
        var name_1 = nameValue[0].toLowerCase();
        // get values
        var values = nameValue[1].split(',');
        // values seperated by ","
        if (values.length > 0) {
            for (var i = 0; i < values.length; i++) {
                values[i] = values[i].trim();
            }
            properties[name_1.trim()] = values;
        }
    }
}
exports.addPropertyObject = addPropertyObject;
function _getJSOJNPath(markup, srcPath) {
    var mName = markup.split('.')
        .slice(0, -1)
        .join('.'); // remove extension
    mName = mName.replace(/\s*/, ''); //  remove spaces
    var dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
    // const path = dirname + "/" + mName + ".json";
    mName += '.json';
    return path.join(dirname, mName);
}
function cleanUpComment(inputComment) {
    var outputComment = inputComment;
    outputComment = outputComment.replace(startCommentRegex, '');
    outputComment = outputComment.replace(endCommentRegex, '');
    return outputComment;
}
function getSectionObjectOfComment(cssCommentPathObject, sections) {
    var cssComment = cssCommentPathObject.comment;
    var srcPath = cssCommentPathObject.srcPath;
    // check if it is a KSS comment block
    if (sectionRegex.test(cssComment)) {
        // strip out the start and end comment markers
        cssComment = cleanUpComment(cssComment);
        //put the comment lines in an array
        var cssLines = cssComment.split("\n");
        //use last line as the style information and remove from the array
        var sectionData = cssLines.pop();
        sectionData = sectionData.replace(/styleguide\s/i, "")
            .toLowerCase();
        //create a section object and any required parent objects
        var sectionObject = addSubSectionsToObject(sectionData.split("."), sections, null, null, null);
        // if a section can't be created from this comment then it will be null - therefore skip this comment
        if (!sectionObject) {
            return -1;
        }
        // set the source path
        sectionObject.srcPath = srcPath;
        //take the title from the first line and removes from array
        var sectionTitle = cssLines.shift()
            .trim();
        sectionObject.sectionTitle = sectionTitle;
        // test if array have more lines
        if (cssLines.length <= 0) {
            return sectionObject;
        }
        //remove empty first and last lines
        if (cssLines[0].length === 0) {
            cssLines.shift();
        }
        if (cssLines.length > 0 && cssLines[cssLines.length - 1].length === 0) {
            cssLines.pop();
        }
        // check if the comment contains markup
        var markupCommentIndex_1 = -1;
        var commentContainsMarkup = cssLines.some(function (element, index) {
            var markupTest = new RegExp("markup:", "i").test(element);
            if (markupTest) {
                markupCommentIndex_1 = index;
                return true;
            }
            return false;
        });
        // check if the comment contains alternative markup
        var alternativeMarkup_1;
        var commentContainsAlternativeMarkup = cssLines.some(function (element, index) {
            var alternativeMarkupTest = new RegExp("alternative-markup:", "i").test(element);
            if (alternativeMarkupTest) {
                alternativeMarkup_1 = element;
                return true;
            }
            return false;
        });
        var alternativeScss_1;
        var commentContainsAlternativeScss = cssLines.some(function (element, index) {
            var alternativeScssTest = new RegExp("alternative-scss-file:", "i").test(element);
            if (alternativeScssTest) {
                alternativeScss_1 = element.replace(/alternative-scss-file:/i, '')
                    .trim();
                return true;
            }
            return false;
        });
        if (commentContainsAlternativeScss && alternativeScss_1) {
            var alternativeSrcPath = srcPath.substring(0, srcPath.lastIndexOf("/") + 1);
            sectionObject.alternativeSrcPath = alternativeSrcPath + alternativeScss_1;
        }
        var alternative2Markup_1;
        var commentContainsAlternative2Markup = cssLines.some(function (element, index) {
            var alternative2MarkupTest = new RegExp("alternative2-markup:", "i").test(element);
            if (alternative2MarkupTest) {
                alternative2Markup_1 = element;
                return true;
            }
            return false;
        });
        var alternative2Scss_1;
        var commentContainsAlternative2Scss = cssLines.some(function (element, index) {
            var alternative2ScssTest = new RegExp("alternative2-scss-file:", "i").test(element);
            if (alternative2ScssTest) {
                alternative2Scss_1 = element.replace(/alternative2-scss-file:/i, '').trim();
                return true;
            }
            return false;
        });
        if (commentContainsAlternative2Scss && alternative2Scss_1) {
            var alternative2SrcPath = srcPath.substring(0, srcPath.lastIndexOf("/") + 1);
            sectionObject.alternative2SrcPath = alternative2SrcPath + alternative2Scss_1;
        }
        //get the description and remove from the lines
        var descriptionLines = []; //cssLines;
        var descriptionString = '';
        if (commentContainsMarkup) {
            descriptionLines = cssLines.slice(0, markupCommentIndex_1);
            cssLines = cssLines.slice(markupCommentIndex_1);
            descriptionString = descriptionLines.join('  \n'); //2 spaces for a markdown new line ;-)
            descriptionString = descriptionString.replace(/^\s+|\s+$/g, '');
            if (descriptionString !== "") {
                sectionObject.description = descriptionString.trim();
            }
        }
        /**
         * letiations block
         * **/
        // check if letiations are available (start with .)
        // get letiations
        var letiationsIndexStart_1 = -1;
        var letiationsIndexEnd_1 = -1;
        var letiations_1 = [];
        var commentContainsletiations = cssLines.some(function (element, index, array) {
            if (element.search(/^(\.|\:)\w+/i) === 0) { /* ^\..* */
                // found letiations start
                if (letiationsIndexStart_1 === -1) {
                    letiationsIndexStart_1 = index;
                }
                // found letiations end
                letiationsIndexEnd_1 = index;
                letiations_1.push(element);
            }
            if (index === array.length - 1 && letiations_1.length > 0) {
                return true;
            }
            return false;
        });
        var markupLines = void 0;
        // get markup above letiations
        // remove letiations if available
        // leave properties below letiations in cssLines
        if (commentContainsletiations) {
            //TODO if letiations without markup are allowed: descriptionLines = cssLines.slice(0, letiationsIndexStart);
            //let letiationLines = cssLines.slice(letiationIndexStart, letiationIndexEnd);
            markupLines = cssLines.slice(0, letiationsIndexStart_1);
            cssLines = cssLines.slice(letiationsIndexEnd_1 + 1);
            sectionObject.letiations = splitletiations(letiations_1);
        }
        /**
         * properties block
         * **/
        //load further properties
        // check if line starts with 'propertyName:' (but not 'Markup:', 'Angular-Markup:)
        var propertiesIndexStart_1 = -1;
        var propertiesIndexEnd_1 = -1;
        var properties_1 = {};
        var commentContainsProperties = cssLines.some(function (el, ind, ar) {
            if (el.search(/^([a-zA-Z0-9_-]+(?=:))(?!::)/gi) === 0) {
                if (el.search(/Markup:/i) !== 0 && el.search(/Angular-Markup:/i) !== 0) {
                    if (propertiesIndexStart_1 === -1) {
                        propertiesIndexStart_1 = ind;
                    }
                    propertiesIndexEnd_1 = ind;
                    addPropertyObject(el, properties_1);
                }
            }
            if (ind === ar.length - 1 && /*!_.isEmpty(properties)*/ Object.keys(properties_1).length !== 0) {
                return true;
            }
            return false;
        });
        if (commentContainsProperties) {
            // if comments contains properties and no markup (assumption: no letiations)
            if (!commentContainsMarkup) {
                descriptionLines = cssLines.slice(0, propertiesIndexStart_1);
                descriptionString = descriptionLines.join('\n');
                descriptionString = descriptionString.replace(/^\s+|\s+$/g, '');
                if (descriptionString !== "") {
                    sectionObject.description = descriptionString.trim();
                }
                // comments contain markup and not already defined by letiations
            }
            else if (!markupLines) {
                markupLines = cssLines.slice(0, propertiesIndexStart_1);
            }
            cssLines = cssLines.slice(propertiesIndexEnd_1 + 1);
            sectionObject.properties = properties_1;
        }
        // if comments does not contain markup, letiations an no properties
        if (!commentContainsMarkup && !commentContainsProperties && !commentContainsletiations) {
            // no properties and no markup but description
            descriptionLines = cssLines;
            descriptionString = descriptionLines.join('\n');
            if (descriptionString !== "") {
                sectionObject.description = descriptionString.trim();
            }
            cssLines = [];
        }
        //load the markup
        if (!markupLines) {
            markupLines = cssLines;
        }
        var markup = markupLines.join("\n");
        //test if markup is available
        var markupAvailable = new RegExp("^\s*Markup:\s*", "i").test(markup);
        // test if anuglar-markup is available
        var angularMarkupAvailable = new RegExp("^\s*Angular-Markup:\s*", "i").test(markup);
        var path_1, data = void 0, alternativePath = void 0, alternativeData = void 0, alternative2Path = void 0, alternative2Data = void 0;
        var jsonFileName = void 0;
        var alternativeJsonFileName = void 0, alternative2JsonFileName = void 0;
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
            markup = markup.replace(/^\s*Markup:\s*/i, "");
            sectionObject.markup = markup.trim();
            // if markup from hbs file add data context if available
            if (markup.search(/.*\.hbs/gi) === 0) {
                //let mName = markup.replace(/\.hbs\s*/i, ""); // remove extension
                //mName = mName.replace(/\./, "-");  // remove dots
                //mName = mName.replace(/\s*/, "");   //  remove spaces
                //let dirname = srcPath.match(/(.*)[\/\\]/)[1] || '';
                //let path = dirname + "/" + mName + ".json";
                //path = path.trim();
                // use json file specified by json-file
                if (jsonFileName) {
                    path_1 = _getJSOJNPath(jsonFileName, srcPath);
                }
                else {
                    path_1 = _getJSOJNPath(markup, srcPath);
                }
                if (fs.existsSync(path_1)) {
                    try {
                        var fileContents = fs.readFileSync(path_1);
                        data = JSON.parse(fileContents.toString());
                        // webfont hack
                        if (data.hasOwnProperty("cssTemplate") &&
                            data.hasOwnProperty("fontBaseName") &&
                            (data.hasOwnProperty("engine") && data.engine === "fontforge") &&
                            data.cssTemplate.hasOwnProperty("template")) {
                            delete data.cssTemplate.template;
                        }
                        if (data) {
                            sectionObject.markupContext = data;
                            sectionObject.markupContextPath = jsonFileName;
                        }
                    }
                    catch (exception) {
                        console.warn("cannot parse json file (" + path_1 + ")");
                    }
                }
            }
        }
        if (commentContainsAlternativeMarkup && alternativeMarkup_1 !== undefined) {
            alternativeMarkup_1 = alternativeMarkup_1.replace(/^\s*alternative-Markup:\s*/i, "");
            sectionObject.alternativeMarkup = alternativeMarkup_1.trim();
            // if markup from hbs file add data context if available
            if (alternativeMarkup_1.search(/.*\.hbs/gi) === 0) {
                // use json file specified by json-file
                if (alternativeJsonFileName) {
                    alternativePath = _getJSOJNPath(alternativeJsonFileName, srcPath);
                }
                else {
                    alternativePath = _getJSOJNPath(alternativeMarkup_1, srcPath);
                }
                if (fs.existsSync(alternativePath)) {
                    try {
                        var fileContents = fs.readFileSync(alternativePath);
                        alternativeData = JSON.parse(fileContents.toString());
                        if (alternativeData) {
                            sectionObject.alternativeMarkupContext = alternativeData;
                            sectionObject.alternativeMarkupContextPath = alternativeJsonFileName;
                        }
                    }
                    catch (exception) {
                        console.warn("cannot parse json file (" + alternativePath + ")");
                    }
                }
            }
        }
        if (commentContainsAlternative2Markup && alternative2Markup_1 !== undefined) {
            alternative2Markup_1 = alternative2Markup_1.replace(/^\s*alternative2-Markup:\s*/i, "");
            sectionObject.alternative2Markup = alternative2Markup_1.trim();
            // if markup from hbs file add data context if available
            if (alternative2Markup_1.search(/.*\.hbs/gi) === 0) {
                // use json file specified by json-file
                if (alternative2JsonFileName) {
                    alternative2Path = _getJSOJNPath(alternative2JsonFileName, srcPath);
                }
                else {
                    alternative2Path = _getJSOJNPath(alternative2Markup_1, srcPath);
                }
                if (fs.existsSync(alternative2Path)) {
                    try {
                        var fileContents = fs.readFileSync(alternative2Path);
                        alternative2Data = JSON.parse(fileContents.toString());
                        if (alternative2Data) {
                            sectionObject.alternative2MarkupContext = alternative2Data;
                            sectionObject.alternativ2eMarkupContextPath = alternative2JsonFileName;
                        }
                    }
                    catch (exception) {
                        console.warn("cannot parse json file (" + alternative2Path + ")");
                    }
                }
            }
        }
        return sectionObject;
    }
    return -1;
}
exports.getSectionObjectOfComment = getSectionObjectOfComment;
function convertKccCommentsToSectionObjects(inputComments) {
    var sections = {
        level: 0,
        subSections: []
    };
    inputComments.forEach(function (comment) {
        getSectionObjectOfComment(comment, sections);
    });
    return sections;
}
exports.convertKccCommentsToSectionObjects = convertKccCommentsToSectionObjects;
//# sourceMappingURL=typeScriptCommentsParser.js.map