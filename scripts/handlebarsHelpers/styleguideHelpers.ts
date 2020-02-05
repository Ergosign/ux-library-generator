import { merge, cloneDeep } from 'lodash';
import { Converter } from 'showdown';

const converterOptions = {
  literalMidWordUnderscores: true
};
const converter = new Converter(converterOptions);

export function registerHandlebarsHelpersStyleguide(Handlebars) {

  /**
   * Get a relative path to the root folder of the styleguide for use within the iframe template.
   * Depending on the level of nesting of the modular html files that are displayed in the iframe, this method
   * will return a relative path segment that will point to the root folder of the style guide from
   * the location of the current section in the styleguide. This is necessary because the modular html files that get
   * loaded in the iFrames are nested in folders an the relative path to the root therefore may be different.
   * For example if this helper is called from within a level 2 section then this method will return '../'
   * When called from a level 3 section this method will return '../../' and so on.
   */
  Handlebars.registerHelper('styleGuideRootFolderPath', function() {
    const currentLevel = this.level;
    let path = '';

    for (let i = 0; i < currentLevel - 1; i++) {
      path = '../' + path;
    }
    return path;
  });

  /**
   * iterate over all children of root (level 0)
   */
  Handlebars.registerHelper('eachSectionRoot', (rootSections, options) => {

    let buffer = '';

    if (!options || options === 'undefined' || options === null) {
      return '';
    }

    if (!rootSections || rootSections.level > 0) {
      return '';
    }

    for (const key in rootSections) {
      if (rootSections.hasOwnProperty(key)) {
        const section = rootSections[key];
        if (typeof (section) === 'object') {
          buffer += options.fn(section);
        }
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
  Handlebars.registerHelper('ifReferenceOfSection', function(sectionName, options) {
    return (this.section && sectionName === this.section) ? options.fn(this) : options.inverse(this);
  });

  /**
   * @return string section with SECTIONNAME and all of her subsection from SECTIONS in buffer obj
   */
  const loopSubSection = (sectionName, sections, options) => {

    let buffer = '';

    if (!sectionName && !sections && !options) {
      return '';
    }

    // TODO: I don't understand the logic of this code first if seems to negate the else

    let subSectionKey;
    let subSection;

    // go in the subsection with key: sectionName
    if (sections.hasOwnProperty(sectionName)) {

      const section = sections[sectionName];

      if (typeof (section) === 'object') {
        // is actually a section
        if (section.hasOwnProperty('level')) {

          // add top level subsection
          buffer += options.fn(section);

          for (subSectionKey in section) {
            if (section.hasOwnProperty(subSectionKey)) {
              subSection = section[subSectionKey];

              if (typeof (subSection) === 'object') {
                // ad all subsections
                buffer += loopSubSection(subSection.sectionName, subSection, options);
              }
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
            if (sections.hasOwnProperty(subSectionKey)) {
              subSection = sections[subSectionKey];

              if (subSection && typeof (subSection) === 'object') {
                // ad all subsections
                buffer += loopSubSection(subSection.sectionName, subSection, options);
              }
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
  Handlebars.registerHelper('eachSubSectionQuery', function(query, sections, options) {

    // if parentSection not available
    if (typeof options === 'undefined' || options === null) {
      options = sections;
      sections = this;
    }

    let buffer = '';

    if (!sections || sections === 'undefined' || !query) {
      return '';
    }

    buffer += loopSubSection(query, sections, options);

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
  Handlebars.registerHelper('ifLevel', function(lowerBound, upperBound, options) {
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
  Handlebars.registerHelper('eachVariation', function(options) {

    const context = this;
    let buffer = '';
    if (!this || !context.variations) {
      return '';
    }
    context.variations.forEach((variation) => {

      const newContext = merge(context, variation);
      // add modifier_class to markupContext
      if (!newContext.hasOwnProperty('markupContext')) {
        newContext.markupContext = {};
      }

      newContext.markupContext.modifier_class = (variation.variationClass).join(' ');

      buffer += options.fn(newContext);

    });
    return buffer;
  });

  Handlebars.registerHelper('compare', function(leftValue, operator, rightValue, options) {

    let operators;
    let result;

    if (arguments.length < 3) {
      throw new Error('Handlerbars Helper \'compare\' needs 2 parameters');
    }

    if (options === undefined) {
      options = rightValue;
      rightValue = operator;
      operator = '===';
    }

    operators = {
      '==': (l, r) => {
        return l === r;
      },
      '===': (l, r) => {
        return l === r;
      },
      '!=': (l, r) => {
        return l !== r;
      },
      '!==': (l, r) => {
        return l !== r;
      },
      '<': (l, r) => {
        return l < r;
      },
      '>': (l, r) => {
        return l > r;
      },
      '<=': (l, r) => {
        return l <= r;
      },
      '>=': (l, r) => {
        return l >= r;
      },
      'typeof': (l, r) => {
        return typeof l === r;
      }
    };

    if (!operators[operator]) {
      throw new Error(`Handlerbars Helper 'compare' doesn't know the operator ${operator}`);
    }

    result = operators[operator](leftValue, rightValue);

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('groupedEach', (every, inputArray, options) => {
    let out = '';
    let rowContext;
    let i;

    rowContext = {
      groupedRowItems: []
    };

    if (!inputArray) {
      console.log('Grouped Each requires an input Array');
      return out;
    }

    for (i = 0; i < inputArray.length; i++) {
      if (i > 0 && i % every === 0) {
        // use the row context to generate the HTML for that row
        out += options.fn(rowContext);
        // reset the row context
        rowContext.groupedRowItems = [];
      }
      rowContext.groupedRowItems.push(inputArray[i]);
    }
    // use the final row context to generate any required extra items
    if (rowContext.groupedRowItems.length > 0) {
      out += options.fn(rowContext);
    }

    return out;
  });

  Handlebars.registerHelper('includePartial', (name, context) => {

    const template = Handlebars.partials[name];
    let output;
    if (typeof template === 'function') {
      output = template(context);
    } else {
      const fn = Handlebars.compile(template);

      output = fn(context);
    }

    return new Handlebars.SafeString(output);
  });

  Handlebars.registerHelper('requiresPseudoStateVariations', function(options) {
    const generatePseudoStates = this.properties ? this.properties.generatepseudostates : null;
    if (generatePseudoStates) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('addPseudoStateToContext', function(stateName, options) {

    const originalContext = this;

    // the context found from the sourceArray
    const foundContext = {
      stateModifier: 'pseudo-class-' + stateName
    };

    // merge the
    const mergedContext = cloneDeep(originalContext);
    mergedContext.markupContext = merge({}, originalContext.markupContext, foundContext);

    const returnHTML = options.fn(mergedContext);

    return new Handlebars.SafeString(returnHTML);

  });

  Handlebars.registerHelper('eachPseudoVariation', function(options) {

    const pseudoClasses = ['hover', 'active', 'focus'];
    const firstContext = cloneDeep(this);
    let buffer = '';
    if (!firstContext) {
      return buffer;
    }

    pseudoClasses.forEach(function(pseudoVariation) {
      const newContext = { ...firstContext };

      // add modifier_class to markupContext
      if (!newContext.hasOwnProperty('markupContext')) {
        newContext.markupContext = {};
      } else {
        newContext.markupContext = { ...newContext.markupContext };
      }

      newContext.markupContext.pseudoClassName = pseudoVariation;
      newContext.markupContext.pseudo_modifier = 'pseudo-class-' + pseudoVariation;

      buffer += options.fn(newContext);

    });
    return buffer;
  });

  Handlebars.registerHelper('eachAlternativePseudoVariation', (options) => {

    const pseudoClasses = ['hover', 'active', 'focus'];
    const firstContext = cloneDeep(this);
    let buffer = '';
    if (!firstContext) {
      return buffer;
    }

    pseudoClasses.forEach(function(pseudoVariation) {
      const newContext = cloneDeep(firstContext);

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

  Handlebars.registerHelper('eachAlternative2PseudoVariation', function(options) {

    const pseudoClasses = ['hover', 'active', 'focused'];
    const newContext = cloneDeep(this);
    let buffer = '';
    if (!newContext) {
      return buffer;
    }

    pseudoClasses.forEach((pseudoVariation) => {

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

  Handlebars.registerHelper('hasSizeVariations', function(options) {
    const sizeVariations = this.properties ? this.properties.sizevariations : null;
    if (sizeVariations) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('includeSizeVariation', function(requiredSizeVariation, options) {
    const sizeVariations = this.properties ? this.properties.sizevariations : null;

    if (sizeVariations) {
      if (sizeVariations.indexOf(requiredSizeVariation) >= 0) {
        return options.fn(this);
      }
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('markedMarkdown', function(options) {
    const wrapperContents = options.fn(this);

    return converter.makeHtml(wrapperContents);
  });

  Handlebars.registerHelper('index_of', (context, ndx) => {
    return context[ndx];
  });
}
