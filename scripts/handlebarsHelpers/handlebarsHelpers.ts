
export function registerHandlebarsHelpers(handlebarsEngine) {

  /**
   * works example markup for codebox
   */
  handlebarsEngine.registerHelper(
    'convertAngularMarkup',
    (inputMarkup: string) => {
      // makes single-quotes in arrays in Angular properties work
      inputMarkup = inputMarkup.replace(/\]="\[(.|\s)*?\]"/gm, (m) => {
        return m.replace(/'/g, '\\\'');
      });
      // makes single-quotes in objects in Angular properties work
      inputMarkup = inputMarkup.replace(/\]="\{(.|\s)*?\}"/g, (m) => {
        return m.replace(/'/g, '\\\'');
      });
      // concatenate strings and re-do in Angular properties
      inputMarkup = inputMarkup.replace(/\]="\'(.|\s)*?\'"/gm, (m) => {
        return m.replace(/[\n]/gm, ' ');
      });
      // concatenate strings and re-do in Angular properties
      inputMarkup = inputMarkup.replace(/="(.|\s)*?"/gm, (m) => {
        return m.replace(/[\n]/gm, ' ');
      });
      // makes single-quotes and double quotes work in the codebox way
      return inputMarkup.replace(/"'/g, '\\\'').replace(/'"/g, '\\\'').replace(/"/g, '\\\'');
    }
  );

  handlebarsEngine.registerHelper(
    'unescapeStates',
    (inputMarkup: string) => {
      return inputMarkup.replace(/"/g, '\'');
    }
  );

  handlebarsEngine.registerHelper(
    'addValues',
    (firstParamter: number, secondParameter: number) => {
      return firstParamter + secondParameter;
    }
  );

  handlebarsEngine.registerHelper('addPseudoClassesAndModifiers',
    (inputMarkup: string, pseudoSelector: string, modifier: string, disabledProperty: boolean, disabledPropertyName: string) => {
      let outputMarkup = inputMarkup;
      if (pseudoSelector && pseudoSelector.length > 1) {
        let markupArray = outputMarkup.split(' ');
        if (markupArray.length === 1) {
          const firstIndex = outputMarkup.indexOf('>');
          outputMarkup = outputMarkup.substr(0, firstIndex) + ' ' + outputMarkup.substr(firstIndex);
          markupArray = outputMarkup.split(' ');
        }
        if (pseudoSelector === ':host') {
          markupArray.splice(1, 0, '[es-pseudoclass]="\'pseudoclass--\' + state"');
        } else {
          markupArray.splice(1, 0, '[es-pseudoclass]="\'pseudoclass--\' + state" [pseudoclassSelector]="\'' + pseudoSelector + '\'"');
        }
        outputMarkup = markupArray.join(' ');
        // outputMarkup = outputMarkup.replace(/><\//gm, ' [es-pseudoclass]="\'pseudoclass--\' + state" [pseudoclassSelector]="\'' + pseudoSelector + '\'"></');
      }
      if (modifier && modifier.length > 1) {
        const markupArray = outputMarkup.split(' ');
        let modifierIndex = -1;
        markupArray.forEach((value, index) => {
          if (value.match(/\[modifier]/)) {
            modifierIndex = index;
          }
        });
        let modifierText = '';
        if (modifierIndex > 0) {
          const existingModifier = markupArray[modifierIndex];
          const modifierStartPosition = existingModifier.indexOf('="\'') + 3;
          const modifierEndPosition = existingModifier.indexOf('\'"', modifierStartPosition);
          let concatenatedModifiers = existingModifier.substring(modifierStartPosition, modifierEndPosition);
          concatenatedModifiers += ' ' + modifier;
          concatenatedModifiers = concatenatedModifiers.replace(/\./g, '');
          modifierText = '[modifier]="\'' + concatenatedModifiers + '\'"' + existingModifier.substring(modifierEndPosition + 2);
          markupArray.splice(markupArray.length - 1, 1, modifierText);
          outputMarkup = markupArray.join(' ');
          // outputMarkup = outputMarkup.replace(/\[modifier](.*?)'"/, modifierText);
        } else {
          modifierText = ' [modifier]="\'' + modifier + '\'"';
          modifierText = modifierText.replace(/\./g, '');
          const markupSplit = outputMarkup.split('></');
          markupSplit.splice(markupSplit.length - 1, 0, modifierText);
          markupSplit.splice(markupSplit.length - 1, 1, '></' + markupSplit[markupSplit.length - 1]);
          outputMarkup = markupSplit.join('');
        }
      }

      // concatenate strings and re-do in Angular properties
      outputMarkup = outputMarkup.replace(/\]="\'(.|\s)*?\'"/gm, (m) => {
        return m.replace(/[\n]/gm, ' ');
      });
      // concatenate strings and re-do in Angular properties
      outputMarkup = outputMarkup.replace(/="(.|\s)*?"/gm, (m) => {
        return m.replace(/[\n]/gm, ' ');
      });
      if (disabledProperty) {
        const markupArray = outputMarkup.split(' ');
        if (disabledPropertyName && disabledPropertyName.length > 1) {
          markupArray.splice(1, 0, '[' + disabledPropertyName + ']="state === \'disabled\' ? true : null"');
          outputMarkup = markupArray.join(' ');
        } else {
          markupArray.splice(1, 0, '[disabled]="state === \'disabled\' ? true : null"');
          outputMarkup = markupArray.join(' ');
        }
      }
      return outputMarkup;
    }
  );

  handlebarsEngine.registerHelper('addModifiers',
    (inputMarkup: string, modifier: string) => {
      let outputMarkup = inputMarkup;
      outputMarkup = outputMarkup.replace(/<\w(.|\s)*?>/gm, (match) => {
        if (match.indexOf(' ') === -1) {
          match = match.replace(/>$/, ' >');
        }
        return match;
      });
      if (modifier && modifier.length > 1) {
        const markupArray = outputMarkup.split(' ');
        let modifierIndex = -1;
        markupArray.forEach((value, index) => {
          if (value.match(/\[modifier]/)) {
            modifierIndex = index;
          }
        });
        let modifierText = '';
        if (modifierIndex > 0) {
          const existingModifier = markupArray[modifierIndex];
          const modifierStartPosition = existingModifier.indexOf('="\'') + 3;
          const modifierEndPosition = existingModifier.indexOf('\'"', modifierStartPosition);
          let concatenatedModifiers = existingModifier.substring(modifierStartPosition, modifierEndPosition);
          concatenatedModifiers += ' ' + modifier;
          concatenatedModifiers = concatenatedModifiers.replace(/\./g, '');
          modifierText = '[modifier]="\'' + concatenatedModifiers + '\'"' + existingModifier.substring(modifierEndPosition + 2);
          markupArray.splice(markupArray.length - 1, 1, modifierText);
          outputMarkup = markupArray.join(' ');
          // outputMarkup = outputMarkup.replace(/\[modifier](.*?)'"/, modifierText);
        } else {
          modifierText = ' [modifier]="\'' + modifier + '\'"';
          modifierText = modifierText.replace(/\./g, '');
          const markupSplit = outputMarkup.split('></');
          markupSplit.splice(markupSplit.length - 1, 0, modifierText);
          markupSplit.splice(markupSplit.length - 1, 1, '></' + markupSplit[markupSplit.length - 1]);
          outputMarkup = markupSplit.join('');
        }
      }
      return outputMarkup;
    }
  );

  handlebarsEngine.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });

  /**
   * for codebox: makes newlines so they will get concatenated
   */
  handlebarsEngine.registerHelper(
    'covertCodeboxNewlines',
    (inputMarkup: string) => {
      // concatenates newlines without leading +-character
      inputMarkup = inputMarkup.replace(/((?:[^\+])(\n))/gm, (m) => {
        return m.replace(/\n/, '\' +\n\'\\n');
      });
      return inputMarkup;
    }
  );

  /**
   * for ux library imports in uilibrouting module
   */
  handlebarsEngine.registerHelper(
    'dashedModuleNamePath',
    (sectionName: string) => {
      sectionName = sectionName.replace(/\s/g, '-').replace(/^[A-Z]/g, (m) => {
        return m.toLowerCase();
      }).replace(/[A-Z]/g, (m) => {
        return '-' + m.toLowerCase();
      }).replace(/ /g, '').replace(/--/g, '-').replace(/[()]/g, '');
      return sectionName;
    }
  );

  handlebarsEngine.registerHelper('json', (context) => {
    return JSON.stringify(context);
  });
}
