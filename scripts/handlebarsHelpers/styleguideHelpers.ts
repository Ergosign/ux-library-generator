let _ = require('lodash');
let showdown = require('showdown');

let converterOptions = {'literalMidWordUnderscores': true};
let converter = new showdown.Converter(converterOptions);

export function registerHandlebarsHelpersStyleguide(Handlebars) {

    /**
     * Get a relative path to the root folder of the styleguide for use within the iframe template.
     * Depending on the level of nesting of the modular html files that are displayed in the iframe, this method
     * will return a relative path segment that will point to the root folder of the style guide from
     * the location of the current section in the styleguide. This is necessary because the modular html files that get
     * loaded in the iframes are nested in folders an the relative path to the root therefore may be different.
     * For example if this helper is called from within a level 2 section then this method will return '../'
     * When called from a level 3 section this method will return '../../' and so on.
     */
    Handlebars.registerHelper('styleGuideRootFolderPath', function () {
        let currentLevel = this.level;
        let path = '';

        for (let i = 0; i < currentLevel - 1; i++) {
            path = '../' + path;
        }
        return path;
    });

    /**
     * iterate over all children of root (level 0)
     * */
    Handlebars.registerHelper('eachSectionRoot', function (rootSections, options) {

            let buffer = '';

            if (!options || options === 'undefined' || options === null) {
                return '';
            }

            if (!rootSections || rootSections.level > 0) {
                return '';
            }

            for (let key in rootSections) {

                let section = rootSections[key];
                if (typeof (section) === 'object') {
                    buffer += options.fn(section);
                }

            }

            return buffer;
        }
    );

    /**
     * Equivalent to "if the current reference is X". e.g:
     *
     * {{#ifReference 'base.headings'}}
     *    IF CURRENT REFERENCE IS base.headings ONLY
     *   {{else}}
     *    ANYTHING ELSE
     * {{/ifReference}}
     */
    Handlebars.registerHelper('ifReferenceOfSection', function (sectionName, options) {
        return (this.section && sectionName === this.section) ? options.fn(this) : options.inverse(this);
    });

    /**
     * @return string section with SECTIONNAME and all of her subsection from SECTIONS in buffer obj
     * */
    let _loopSubSection = function (sectionName, sections, options) {

        let buffer = '';

        if (!sectionName && !sections && !options) {
            return '';
        }

        //TODO: I don't understand the logic of this code first if seems to negate the else

        let subSectionKey, subSection;

        // go in the subsection with key: sectionName
        if (sections.hasOwnProperty(sectionName)) {

            let section = sections[sectionName];

            if (typeof (section) === 'object') {
                // is actually a section
                if (section.hasOwnProperty('level')) {

                    // add top level subsection
                    buffer += options.fn(section);

                    for (subSectionKey in section) {
                        subSection = section[subSectionKey];

                        if (typeof (subSection) === 'object') {
                            // ad all subsections
                            buffer += _loopSubSection(subSection.sectionName, subSection, options);
                        }
                    }
                }
            }
            // already in the right section
        } else if (sections.sectionName === sectionName) {

            if (typeof (sections) === 'object') {
                // is actually a section
                if (sections.hasOwnProperty('level')) {
                    // add top level subsection
                    buffer += options.fn(sections);

                    for (subSectionKey in sections) {
                        subSection = sections[subSectionKey];

                        if (subSection && typeof (subSection) === 'object') {
                            // ad all subsections
                            buffer += _loopSubSection(subSection.sectionName, subSection, options);
                        }
                    }
                }
            }
        }

        return buffer;
    };

    /**
     * Loop over a section query. If a number is supplied, will convert into
     * a query for all children and descendants of that reference.
     * @param  {Mixed} query The section query
     */
    Handlebars.registerHelper('eachSubSectionQuery', function (query, sections, options) {

        // if parentSection not available
        if (typeof options === 'undefined' || options === null) {
            options = sections;
            sections = this;
        }

        let buffer = '';

        if (!sections || sections === 'undefined' || !query) {
            return '';
        }

        buffer += _loopSubSection(query, sections, options);

        return buffer;
    });

    /**
     * Takes a range of numbers that the current section's depth/level must be within.
     *
     * Equivalent to "if the current section is X levels deep". e.g:
     *
     * {{#ifLevel 1}}
     *    ROOT ELEMENTS ONLY
     *   {{else}}
     *    ANYTHING ELSE
     * {{/ifLevel}}
     */
    Handlebars.registerHelper('ifLevel', function (lowerBound, upperBound, options) {
        // If only 1 parameter is passed, upper bound is the same as lower bound.
        if (typeof options === 'undefined' || options === null) {
            options = upperBound;
            upperBound = lowerBound;
        }
        return (this.level && this.level >= lowerBound && this.level <= upperBound) ? options.fn(this) : options.inverse(this);
    });

    /**
     * Similar to the {#eachSection} helper, however will loop over each modifier
     * @param  {Object} section Supply a section object to loop over its modifiers. Defaults to the current section.
     */
    Handlebars.registerHelper('eachVariation', function (options) {

        let context = this;
        let buffer = '';
        if (!this || !context.variations) {
            return '';
        }
        context.variations.forEach(function (variation) {

            let newContext = _.merge(context, variation);
            // add modifier_class to markupContext
            if (!newContext.hasOwnProperty('markupContext')) {
                newContext.markupContext = {};
            }

            newContext.markupContext.modifier_class = (variation.variationClass).join(" ");

            buffer += options.fn(newContext);

        });
        return buffer;
    });

    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

        let operators, result;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }

        operators = {
            '==': function (l, r) {
                return l == r;
            },
            '===': function (l, r) {
                return l === r;
            },
            '!=': function (l, r) {
                return l != r;
            },
            '!==': function (l, r) {
                return l !== r;
            },
            '<': function (l, r) {
                return l < r;
            },
            '>': function (l, r) {
                return l > r;
            },
            '<=': function (l, r) {
                return l <= r;
            },
            '>=': function (l, r) {
                return l >= r;
            },
            'typeof': function (l, r) {
                return typeof l == r;
            }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('groupedEach', function (every, inputArray, options) {
        let out = "", rowContext, i;

        rowContext = {
            groupedRowItems: []
        };

        if (!inputArray) {
            console.log("Grouped Each requires an input Array");
            return out;
        }

        for (i = 0; i < inputArray.length; i++) {
            if (i > 0 && i % every === 0) {
                //use the row context to generate the HTML for that row
                out += options.fn(rowContext);
                //reset the row context
                rowContext.groupedRowItems = [];
            }
            rowContext.groupedRowItems.push(inputArray[i]);
        }
        //use the final row context to generate any required extra items
        if (rowContext.groupedRowItems.length > 0) {
            out += options.fn(rowContext);
        }

        return out;
    });

    Handlebars.registerHelper('includePartial', function (name, context) {

        let template = Handlebars.partials[name];
        let output;
        if (typeof template == 'function') {
            output = template(context)
        } else {
            let fn = Handlebars.compile(template);

            output = fn(context);//.replace(/^\s+/, '');
        }

        return new Handlebars.SafeString(output);
    });

    Handlebars.registerHelper('requiresPseudoStateVariations', function (options) {
        let generatePseudoStates = this.properties ? this.properties.generatepseudostates : null;
        if (generatePseudoStates) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('addPseudoStateToContext', function (stateName, options) {

        let originalContext = this;

        //the context found from the sourceArray
        let foundContext = {
            stateModifier: "pseudo-class-" + stateName
        };

        //merge the
        let mergedContext = _.cloneDeep(originalContext);
        mergedContext.markupContext = _.merge({}, originalContext.markupContext, foundContext);

        let returnHTML = options.fn(mergedContext);

        return new Handlebars.SafeString(returnHTML);

    });

    Handlebars.registerHelper('eachPseudoVariation', function (options) {

        let pseudoClasses = ['hover', 'active', 'focus'];
        let newContext = _.cloneDeep(this);
        let buffer = '';
        if (!newContext) {
            return buffer;
        }

        pseudoClasses.forEach(function (pseudoVariation) {

            // add modifier_class to markupContext
            if (!newContext.hasOwnProperty('markupContext')) {
                newContext.markupContext = {};
            }

            newContext.markupContext.pseudoClassName = pseudoVariation;
            newContext.markupContext.pseudo_modifier = 'pseudo-class-' + pseudoVariation;

            buffer += options.fn(newContext);

        });
        return buffer;
    });

    Handlebars.registerHelper('eachAlternativePseudoVariation', function (options) {

        let pseudoClasses = ['hover', 'active', 'focus'];
        let newContext = _.cloneDeep(this);
        let buffer = '';
        if (!newContext) {
            return buffer;
        }

        pseudoClasses.forEach(function (pseudoVariation) {

            // add modifier_class to markupContext
            if (!newContext.hasOwnProperty('alternativeMarkupContext')) {
                newContext.alternativeMarkupContext = {};
            }

            newContext.alternativeMarkupContext.pseudoClassName = pseudoVariation;
            newContext.alternativeMarkupContext.pseudo_modifier = 'pseudo-class-' + pseudoVariation;

            buffer += options.fn(newContext);

        });
        return buffer;
    });

    Handlebars.registerHelper('eachAlternative2PseudoVariation', function (options) {

        let pseudoClasses = ['hover', 'active', 'focused'];
        let newContext = _.cloneDeep(this);
        let buffer = '';
        if (!newContext) {
            return buffer;
        }

        pseudoClasses.forEach(function (pseudoVariation) {

            // add modifier_class to markupContext
            if (!newContext.hasOwnProperty('alternative2MarkupContext')) {
                newContext.alternative2MarkupContext = {};
            }

            newContext.alternative2MarkupContext.pseudoClassName = pseudoVariation;
            newContext.alternative2MarkupContext.pseudo_modifier = 'dx-state-' + pseudoVariation;

            buffer += options.fn(newContext);

        });
        return buffer;
    });

    Handlebars.registerHelper('hasSizeVariations', function (options) {
        let sizeVarations = this.properties ? this.properties.sizevariations : null;
        if (sizeVarations) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('includeSizeVariation', function (requiredSizeVariation, options) {
        let sizeVarations = this.properties ? this.properties.sizevariations : null;

        if (sizeVarations) {
            if (sizeVarations.indexOf(requiredSizeVariation) >= 0) {
                return options.fn(this);
            }
        }
        return options.inverse(this);
    });

    /**
     * Get a relative path to the root folder of the styleguide for use within the iframe template.
     * Depending on the level of nesting of the modular html files that are displayed in the iframe, this method
     * will return a relative path segment that will point to the root folder of the style guide from
     * the location of the current section in the styleguide. This is necessary because the modular html files that get
     * loaded in the iframes are nested in folders an the relative path to the root therefore may be different.
     * For example if this helper is called from within a level 2 section then this method will return '../'
     * When called from a level 3 section this method will return '../../' and so on.
     */
    Handlebars.registerHelper('styleGuideRootFolderPath', function () {
        let currentLevel = this.level;
        let path = '';

        for (let i = 0; i < currentLevel - 1; i++) {
            path = '../' + path;
        }
        return path;
    });

    Handlebars.registerHelper('markedMarkdown', function (options) {
        let wrapperContents = options.fn(this);

        return converter.makeHtml(wrapperContents);
    });

    Handlebars.registerHelper('index_of', function(context, ndx)
    {
        return context[ndx];
    });
};
