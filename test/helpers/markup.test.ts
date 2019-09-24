import * as Handlebars from 'handlebars';

// Local helpers
import { registerHandlebarsHelpersMarkup} from '../../scripts/handlebarsHelpers/markupHelpers';
registerHandlebarsHelpersMarkup(Handlebars, {});

describe('the {{markupWithStyle}}', () => {

    let context;

    beforeEach( () => {
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
            markupContext: {
                modifier_class: 'btn--grey',
                actionText: 'read more',
                actionTarget: 'more.html'
            }
        };
    });

    it('should return markup with style', () => {
        const template = Handlebars.compile('{{{markupWithStyle}}}');
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn btn--grey" href="more.html">read more</a>');
    });

    it('should use a parameter to replace modifier class', () => {
        const template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href="more.html">read more</a>');
    });

    it('should work with an empty context', () => {
        const template = Handlebars.compile('{{{markupWithStyle}}}');
        context.markupContext = {};
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn " href=""></a>');
    });

    it('should work with an empty context but with modifier', () => {
        const template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context.markupContext = {};
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', () => {
        const template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier]" href=""></a>');
    });

    it('should work with an context without markupContext', () => {
        const template = Handlebars.compile('{{{markupWithStyle \'[test modifier]\' \'[test state]\'}}}');
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}} {{stateModifier}}" href="{{actionTarget}}">{{actionText}}</a>'
        };
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('<a class="btn [test modifier] [test state]" href=""></a>');
    });

});

describe('{{displayMarkupPath}}', () => {

    it('should return empty string', () => {
        const template = Handlebars.compile('{{{displayMarkupPath}}}');
        const renderedHTML = template({});
        expect(renderedHTML).toEqual('');
    });

    it('should return empty String', () => {
        const context =  {
            markup: '<a href="test">test</a>'
        };

        const template = Handlebars.compile('{{{displayMarkupPath}}}');
        const renderedHTML = template(context);         expect(renderedHTML).toEqual('');
    });

    it('should return markupPath', () => {
        const context =  {
            srcPath: '/testPath/',
            markup: 'test.hbs'
        };

        const template = Handlebars.compile('{{{displayMarkupPath}}}');
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual('/testPath/test.hbs');
    });

});

describe('Generation of Code Examples', () => {

    let context;

    beforeEach(() => {
        context = {
            srcPath: '/testPath/',
            markup: '<a class="btn {{modifier_class}}" href="{{actionTarget}}">{{actionText}}</a>',
            markupContext: {
                modifier_class: 'btn--grey',
                actionText: 'read more',
                actionTarget: 'more.html'
            }
        };
    });

    it('should render HTML', () => {
        const modifier = 'abc123';
        const template = Handlebars.compile(`{{{markupWithStyle '${modifier}'}}}`);
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual(`<a class="btn ${modifier}" href="${context.markupContext.actionTarget}">${context.markupContext.actionText}</a>`);
    });

    it('should render escaped HTML', () => {
        const modifier = 'abc123';
        const template = Handlebars.compile(`{{markupWithStyle '${modifier}'}}`);
        const renderedHTML = template(context);
        expect(renderedHTML).toEqual(`&lt;a class&#x3D;&quot;btn ${modifier}&quot; href&#x3D;&quot;${context.markupContext.actionTarget}&quot;&gt;${context.markupContext.actionText}&lt;/a&gt;`);
    });
});
