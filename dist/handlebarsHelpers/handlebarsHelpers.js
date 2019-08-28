"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function registerHandlebarsHelpers(handlebarsEngine) {
    /**
     * works example markup for codebox
     */
    handlebarsEngine.registerHelper('convertAngularMarkup', function (inputMarkup) {
        // makes single-quotes in arrays in angularised properties work
        inputMarkup = inputMarkup.replace(/\]="\[(.|\s)*?\]"/gm, function (m) {
            return m.replace(/'/g, '\\\'');
        });
        // makes single-quotes in objects in angularised properties work
        inputMarkup = inputMarkup.replace(/\]="\{(.|\s)*?\}"/g, function (m) {
            return m.replace(/'/g, '\\\'');
        });
        // concatenate strings and re-do in angularised properties
        inputMarkup = inputMarkup.replace(/\]="\'(.|\s)*?\'"/gm, function (m) {
            return m.replace(/[\n]/gm, ' ');
        });
        // concatenate strings and re-do in angularised properties
        inputMarkup = inputMarkup.replace(/="(.|\s)*?"/gm, function (m) {
            return m.replace(/[\n]/gm, ' ');
        });
        // makes single-quotes and double quotes work in the codebox way
        return inputMarkup.replace(/"'/g, '\\\'').replace(/'"/g, '\\\'').replace(/"/g, '\\\'');
    });
    handlebarsEngine.registerHelper('unescapeStates', function (inputMarkup) {
        return inputMarkup.replace(/"/g, '\'');
    });
    handlebarsEngine.registerHelper('addValues', function (firstParamter, secondParameter) {
        return firstParamter + secondParameter;
    });
    handlebarsEngine.registerHelper('addPseudoClassesAndModifiers', function (inputMarkup, pseudoSelector, modifier, disabledProperty, disabledPropertyName) {
        var outputMarkup = inputMarkup;
        if (pseudoSelector && pseudoSelector.length > 1) {
            var markupArray = outputMarkup.split(' ');
            if (markupArray.length === 1) {
                var firstIndex = outputMarkup.indexOf('>');
                outputMarkup = outputMarkup.substr(0, firstIndex) + ' ' + outputMarkup.substr(firstIndex);
                markupArray = outputMarkup.split(' ');
            }
            if (pseudoSelector === ':host') {
                markupArray.splice(1, 0, '[es-pseudoclass]="\'pseudoclass--\' + state"');
            }
            else {
                markupArray.splice(1, 0, '[es-pseudoclass]="\'pseudoclass--\' + state" [pseudoclassSelector]="\'' + pseudoSelector + '\'"');
            }
            outputMarkup = markupArray.join(' ');
            // outputMarkup = outputMarkup.replace(/><\//gm, ' [es-pseudoclass]="\'pseudoclass--\' + state" [pseudoclassSelector]="\'' + pseudoSelector + '\'"></');
        }
        if (modifier && modifier.length > 1) {
            var markupArray = outputMarkup.split(' ');
            var modifierIndex_1 = -1;
            markupArray.forEach(function (value, index) {
                if (value.match(/\[modifier]/)) {
                    modifierIndex_1 = index;
                }
            });
            var modifierText = '';
            if (modifierIndex_1 > 0) {
                var existingModifier = markupArray[modifierIndex_1];
                var modifierStartPosition = existingModifier.indexOf('="\'') + 3;
                var modifierEndPosition = existingModifier.indexOf('\'"', modifierStartPosition);
                var concatenatedModifiers = existingModifier.substring(modifierStartPosition, modifierEndPosition);
                concatenatedModifiers += ' ' + modifier;
                concatenatedModifiers = concatenatedModifiers.replace(/\./g, '');
                modifierText = '[modifier]="\'' + concatenatedModifiers + '\'"' + existingModifier.substring(modifierEndPosition + 2);
                markupArray.splice(markupArray.length - 1, 1, modifierText);
                outputMarkup = markupArray.join(' ');
                // outputMarkup = outputMarkup.replace(/\[modifier](.*?)'"/, modifierText);
            }
            else {
                modifierText = ' [modifier]="\'' + modifier + '\'"';
                modifierText = modifierText.replace(/\./g, '');
                var markupSplit = outputMarkup.split('></');
                markupSplit.splice(markupSplit.length - 1, 0, modifierText);
                markupSplit.splice(markupSplit.length - 1, 1, '></' + markupSplit[markupSplit.length - 1]);
                outputMarkup = markupSplit.join('');
            }
        }
        // concatenate strings and re-do in angularised properties
        outputMarkup = outputMarkup.replace(/\]="\'(.|\s)*?\'"/gm, function (m) {
            return m.replace(/[\n]/gm, ' ');
        });
        // concatenate strings and re-do in angularised properties
        outputMarkup = outputMarkup.replace(/="(.|\s)*?"/gm, function (m) {
            return m.replace(/[\n]/gm, ' ');
        });
        if (disabledProperty) {
            var markupArray = outputMarkup.split(' ');
            if (disabledPropertyName && disabledPropertyName.length > 1) {
                markupArray.splice(1, 0, '[' + disabledPropertyName + ']="state === \'disabled\' ? true : null"');
                outputMarkup = markupArray.join(' ');
            }
            else {
                markupArray.splice(1, 0, '[disabled]="state === \'disabled\' ? true : null"');
                outputMarkup = markupArray.join(' ');
            }
        }
        return outputMarkup;
    });
    handlebarsEngine.registerHelper('addModifiers', function (inputMarkup, modifier) {
        var outputMarkup = inputMarkup;
        outputMarkup = outputMarkup.replace(/<\w(.|\s)*?>/gm, function (match) {
            if (match.indexOf(' ') === -1) {
                match = match.replace(/>$/, ' >');
            }
            return match;
        });
        if (modifier && modifier.length > 1) {
            var markupArray = outputMarkup.split(' ');
            var modifierIndex_2 = -1;
            markupArray.forEach(function (value, index) {
                if (value.match(/\[modifier]/)) {
                    modifierIndex_2 = index;
                }
            });
            var modifierText = '';
            if (modifierIndex_2 > 0) {
                var existingModifier = markupArray[modifierIndex_2];
                var modifierStartPosition = existingModifier.indexOf('="\'') + 3;
                var modifierEndPosition = existingModifier.indexOf('\'"', modifierStartPosition);
                var concatenatedModifiers = existingModifier.substring(modifierStartPosition, modifierEndPosition);
                concatenatedModifiers += ' ' + modifier;
                concatenatedModifiers = concatenatedModifiers.replace(/\./g, '');
                modifierText = '[modifier]="\'' + concatenatedModifiers + '\'"' + existingModifier.substring(modifierEndPosition + 2);
                markupArray.splice(markupArray.length - 1, 1, modifierText);
                outputMarkup = markupArray.join(' ');
                // outputMarkup = outputMarkup.replace(/\[modifier](.*?)'"/, modifierText);
            }
            else {
                modifierText = ' [modifier]="\'' + modifier + '\'"';
                modifierText = modifierText.replace(/\./g, '');
                var markupSplit = outputMarkup.split('></');
                markupSplit.splice(markupSplit.length - 1, 0, modifierText);
                markupSplit.splice(markupSplit.length - 1, 1, '></' + markupSplit[markupSplit.length - 1]);
                outputMarkup = markupSplit.join('');
            }
        }
        return outputMarkup;
    });
    handlebarsEngine.registerHelper('ifEquals', function (arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
    /**
     * for codebox: makes newlines so they will get concatenated
     */
    handlebarsEngine.registerHelper('covertCodeboxNewlines', function (inputMarkup) {
        // concatenates newlines without leading +-character
        inputMarkup = inputMarkup.replace(/((?:[^\+])(\n))/gm, function (m) {
            return m.replace(/\n/, '\' +\n\'\\n');
        });
        return inputMarkup;
    });
    /**
     * for ux library imports in uilibrouting module
     */
    handlebarsEngine.registerHelper('dashedModuleNamePath', function (sectionName) {
        sectionName = sectionName.replace(/\s/g, '-').replace(/^[A-Z]/g, function (m) {
            return m.toLowerCase();
        }).replace(/[A-Z]/g, function (m) {
            return '-' + m.toLowerCase();
        }).replace(/ /g, '').replace(/--/g, '-').replace(/[()]/g, '');
        return sectionName;
    });
    handlebarsEngine.registerHelper('json', function (context) {
        return JSON.stringify(context);
    });
}
exports.registerHandlebarsHelpers = registerHandlebarsHelpers;
//# sourceMappingURL=handlebarsHelpers.js.map