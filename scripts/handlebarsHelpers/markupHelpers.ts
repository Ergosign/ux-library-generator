/**
 * The standalone handlebars version is used in the markupWithStyleForCodebox helper. This is due to a bug with the engine-handlebars version for assemble, that renders partials asynchronously and therefore the codebox html cant be escaped anymore.
 */
let prettify = require('pretty');

export function registerHandlebarsHelpersMarkup(Handlebars, engine) {

    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('markupWithStyle', function (modifierText, stateModifierText) {
        let context = this;

        if (!context || !context.markup) {
            return '';
        }

        if (typeof modifierText === "string") {
            if (!this.markupContext) {
                this.markupContext = {};
            }
            this.markupContext.modifier_class = modifierText;
        }
        if (typeof stateModifierText === "string") {
            if (!this.markupContext) {
                this.markupContext = {};
            }
            this.markupContext.stateModifier = stateModifierText;
        }

        let markup = context.markup;
        let markupContext = context.markupContext;

        let template;

        if (markup.search(/.*\.hbs/gi) === 0) {
            let mName = markup.replace(".hbs", "");
            template = engine.compile(Handlebars.partials[mName]);
        } else {
            template = Handlebars.compile(markup);
        }

        let html = template(markupContext);
        html = html.trim();

        // TODO @Al Briggs: This helper is called in the styleguide template (like this: "{{markupWithStyle '[modifier_class]'}}") and returns the code that is displayed in the codebox. In the previous grunt assemble project, two braces "{{..}}" did
        // escape the html and rendered it as text in the codebox. Three braces "{{{..}}}" rendered the HTML. But now with the engine-handlebars used by assemble, even the two braces render the HTML and thus break the codebox.
        // I also tried to escape the html tags in this helper but the html returned here contains Async ID's instead of the final markup. This is why I can't replace HTML tags here..
        // Here is an answer to an issue where the async thing is explained: https://github.com/assemble/assemble/issues/811#issuecomment-171673882
        // If I use the regular handlebars in here, the asyncID's are gone and I can replace HTML tags, but that regular handlebars instance of course doesn't know about the partials and layouts registered to the assemble handlebars version.
        // and we probably don't want to run two assemble instances in parallel..
        return html;
    });

    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('alternativeMarkupWithStyle', function (modifierText, stateModifierText) {
        let context = this;

        if (!context || !context.alternativeMarkup) {
            return '';
        }

        if (typeof modifierText === "string") {
            if (!this.alternativeMarkupContext) {
                this.alternativeMarkupContext = {};
            }
            this.alternativeMarkupContext.modifier_class = modifierText;
        }
        if (typeof stateModifierText === "string") {
            if (!this.alternativeMarkupContext) {
                this.alternativeMarkupContext = {};
            }
            this.alternativeMarkupContext.stateModifier = stateModifierText;
        }

        let markup = context.alternativeMarkup;
        let markupContext = context.alternativeMarkupContext;

        let template;

        if (markup.search(/.*\.hbs/gi) === 0) {
            let mName = markup.replace(".hbs", "");
            template = Handlebars.compile('{{> "' + mName + '"}}');
        } else {
            template = Handlebars.compile(markup);
        }

        let html = template(markupContext);
        html = html.trim();

        return html;
    });

    /**
     * Outputs the current section's or modifier's markup.
     */
    Handlebars.registerHelper('alternative2MarkupWithStyle', function (modifierText, stateModifierText)
    {
        let context = this;

        if (!context || !context.alternative2Markup)
        {
            return '';
        }

        if (typeof modifierText === "string")
        {
            if (!this.alternative2MarkupContext)
            {
                this.alternative2MarkupContext = {};
            }
            this.alternative2MarkupContext.modifier_class = modifierText;
        }
        if (typeof stateModifierText === "string")
        {
            if (!this.alternative2MarkupContext)
            {
                this.alternative2MarkupContext = {};
            }
            this.alternative2MarkupContext.stateModifier = stateModifierText;
        }

        let markup = context.alternative2Markup;
        let markupContext = context.alternative2MarkupContext;

        let template;

        if (markup.search(/.*\.hbs/gi) === 0)
        {
            let mName = markup.replace(".hbs", "");
            template = Handlebars.compile('{{> "' + mName + '"}}');
        } else
        {
            template = Handlebars.compile(markup);
        }

        let html = template(markupContext);
        html = html.trim();

        return html;
    });

    Handlebars.registerHelper('displayMarkupPath', function () {
        //Get src path by depending scss file path
        let regEx = /[^\/]*$/;
        let path = "";
        if (this.srcPath) {
            path = this.srcPath.replace(regEx, '');
        }
        if (this.markup) {
            if (this.markup.indexOf(".hbs") >= 0) {
                return path + this.markup;
            }
        }
        if (this.angularMarkupPath) {
            if (this.angularMarkupPath.indexOf(".html") >= 0) {
                return path + this.angularMarkupPath;
            }
        }
        return '';
    });

    /**
     * Returns the path to the alternative markup file.
     */
    Handlebars.registerHelper('displayAlternativeMarkupPath', function () {
        //Get src path by depending scss file path
        let regEx = /[^\/]*$/;
        let path = "";
        if (this.alternativeSrcPath) {
            path = this.alternativeSrcPath.replace(regEx, '');
        }
        if (this.alternativeMarkup) {
            if (this.alternativeMarkup.indexOf(".hbs") >= 0) {
                return path + this.alternativeMarkup;
            }
        }
        return '';
    });


    /**
     * Returns the path to the alternative2 markup file.
     */
    Handlebars.registerHelper('displayAlternative2MarkupPath', function ()
    {
        //Get src path by depending scss file path
        let regEx = /[^\/]*$/;
        let path = "";
        if (this.alternative2SrcPath)
        {
            path = this.alternative2SrcPath.replace(regEx, '');
        }
        if (this.alternative2Markup)
        {
            if (this.alternative2Markup.indexOf(".hbs") >= 0)
            {
                return path + this.alternative2Markup;
            }
        }
        return '';
    });

    Handlebars.registerHelper('displayContextPath', function () {
        //Get src path by depending scss file path
        let regEx = /[^\/]*$/;
        let path = "";
        if (this.srcPath) {
            path = this.srcPath.replace(regEx, '');
        }
        if (this.markupContextPath) {
            if (this.markupContextPath.indexOf(".json") >= 0) {
                return path + this.markupContextPath;
            }
        }
        if (this.angularContextPath) {
            if (this.angularContextPath.indexOf(".json") >= 0) {
                return path + this.angularContextPath;
            }
        }
        return '';
    });

    Handlebars.registerHelper('prefixWithSrcPath', function (suffix, options) {

        if (!this.srcPath) {
            return '';
        }

        //Get src path by depending scss file path
        let regEx = /[^\/]*$/;
        let path = this.srcPath.replace(regEx, '');
        return path + '/' + suffix;

    });

};
