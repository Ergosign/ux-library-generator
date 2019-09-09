import * as Handlebars from 'handlebars';

// Local helpers
import { registerHandlebarsHelpersMarkup} from '../../scripts/handlebarsHelpers/markupHelpers';
registerHandlebarsHelpersMarkup(Handlebars, {});

describe('the {{markupWithStyle}}', function () {

    let context;

    beforeEach(function () {
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
            markupContext: {
                modifier_class: "btn--grey",
                actionText: "read more",
                actionTarget: "more.html"
            }
        };
    });

    it('should return markup with style', function () {
        let template = Handlebars.compile('{{{markupWithStyle}}}');
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn btn--grey" href="more.html">read more</a>');
    });

    it('should use a parameter to replace modifier class', function () {
        let template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href="more.html">read more</a>');
    });

    it('should work with an empty context', function () {
        let template = Handlebars.compile('{{{markupWithStyle}}}');
        context.markupContext = {};
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn " href=""></a>');
    });

    it('should work with an empty context but with modifier', function () {
        let template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context.markupContext = {};
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', function () {
        let template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', function () {
        let template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\' \'[test state]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}} {{stateModifier}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier] [test state]" href=""></a>');
    });

});

describe('{{displayMarkupPath}}', function () {

    it('should return empty string', function () {
        let template = Handlebars.compile('{{{displayMarkupPath}}}');
        let renderedHTML = template({});
        expect(renderedHTML).toEqual('');
    });

    it('should return empty String', function () {
        let context =  {
            markup: '<a href="test">test</a>'
        };

        let template = Handlebars.compile('{{{displayMarkupPath}}}');
        let renderedHTML = template(context);         expect(renderedHTML).toEqual('');
    });

    it('should return markupPath', function () {
        let context =  {
            srcPath: '/testPath/',
            markup: "test.hbs"
        };

        let template = Handlebars.compile('{{{displayMarkupPath}}}');
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual('/testPath/test.hbs');
    });

});

describe('Generation of Code Examples', function () {

    var context;

    beforeEach(function () {
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
            markupContext: {
                modifier_class: "btn--grey",
                actionText: "read more",
                actionTarget: "more.html"
            }
        };
    });

    it('should render HTML', function () {
        let modifier = 'abc123';
        let template = Handlebars.compile(`{{{markupWithStyle '${modifier}'}}}`);
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual(`<a class="btn ${modifier}" href="${context.markupContext.actionTarget}">${context.markupContext.actionText}</a>`);
    });

    it('should render escaped HTML', function () {
        let modifier = 'abc123';
        let template = Handlebars.compile(`{{markupWithStyle '${modifier}'}}`);
        let renderedHTML = template(context);
        expect(renderedHTML).toEqual(`&lt;a class&#x3D;&quot;btn ${modifier}&quot; href&#x3D;&quot;${context.markupContext.actionTarget}&quot;&gt;${context.markupContext.actionText}&lt;/a&gt;`);
    });
});
