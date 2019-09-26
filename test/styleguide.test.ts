import * as Handlebars from 'handlebars';

// Local helpers
import { registerHandlebarsHelpersMarkup } from '../scripts/handlebarsHelpers/markupHelpers';
registerHandlebarsHelpersMarkup(Handlebars, {});
import { registerHandlebarsHelpersStyleguide } from '../scripts/handlebarsHelpers/styleguideHelpers';
registerHandlebarsHelpersStyleguide(Handlebars);

describe('Styleguide Helper Tests', () => {

  let context;

  beforeEach(() => {

    context = {};
  });

  describe('{{#eachSectionRoot rootSections options}} {{/eachSectionRoot}}', () => {

    it('should return empty String', () => {
      const template = Handlebars.compile('{{#eachSectionRoot }} {{sectionName}} {{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return empty String', () => {
      // tslint:disable-next-line:prefer-const
      let undefinedSection;
      context.sections = undefinedSection;
      const template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return empty String', () => {
      const subSections = {
        level: 1
      };

      context.sections = subSections;
      const template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return empty String', () => {
      const emptySections = {
        level: 0
      };
      context.sections = emptySections;
      const template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return output for 1 subsections', () => {
      const testSection = {
        level: 0,
        index: {
          level: 1,
          sectionName: 'Overview',
          sectionDescription: 'more items'
        }
      };

      context.sections = testSection;
      const template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('Overview, more items\n');
    });

    it('should return output for 2 subsections', () => {
      const testSection = {
        level: 0,
        index: {
          level: 1,
          sectionName: 'Overview',
          sectionDescription: 'more items'
        },
        Controls: {
          level: 1,
          sectionName: 'Controls',
          sectionDescription: 'control items'
        }
      };

      context.sections = testSection;
      const template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('Overview, more items\nControls, control items\n');
    });

  });

  // TODO ifReferenceOfSection is never true in our context
  /*describe('{{#ifReferenceOfSection sectionName options}} {{/ifReferenceOfSection}}', function () {

   beforeEach(function () {

   context = {
   level: 0,
   index: {
   level: 1,
   sectionName: 'Overview',
   sectionDescription: 'more items'
   }
   };
   });

   it('should return empty String', function () {
   let template = Handlebars.compile('{{#ifReferenceOfSection notdefined }} true {{/ifReferenceOfSection}}');
   let renderedHTML = template(context);         expect(renderedHTML).toEqual('');
   });

   it('should return empty String', function () {

   context['sectionName'] = 'Overview';

   let template = Handlebars.compile('{{#ifReferenceOfSection sectionName}} true {{/ifReferenceOfSection}}');
   let renderedHTML = template(context);         expect(renderedHTML).toEqual('');
   });
   });
   */

  describe('{{#eachSubSectionQuery query sections options}} {{/eachSectionQuery}}', () => {

    beforeEach(() => {
      const testSections = {
        level: 0,
        index: {
          level: 1,
          sectionName: 'Overview',
          sectionTitle: 'index',
          sectionDescription: 'more items'
        },
        Fonts: {
          level: 2,
          sectionName: 'Fonts',
          sectionTitle: 'Fonts',
          sectionDescription: 'font description',
          WebFonts: {
            level: 2,
            sectionName: 'Webfonts',
            sectionTitle: 'Webfonts',
            sectionDescripton: 'webfonts description'
          }
        },
        Controls: {
          level: 1,
          sectionName: 'Controls',
          sectionTitle: 'Controls',
          sectionDescription: 'control items',
          Button: {
            level: 2,
            sectionName: 'Button',
            sectionTitle: 'Button',
            sectionDescription: 'button description',
            ButtonSmall: {
              level: 3,
              sectionTitle: 'ButtonSmall',
              sectionName: 'ButtonSmall',
              sectionDescription: 'ButtonSmall'
            }
          },
          Dropdown: {
            level: 2,
            sectionName: 'Dropdown',
            sectionTitle: 'Dropdown',
            sectionDescription: 'dropdown description'
          }
        }
      };
      context.sections = testSections;
    });

    it('should return empty String', () => {

      const template = Handlebars.compile(`{{#eachSubSectionQuery 'NamenotInList' sections}} {{sectionName}} {{/eachSubSectionQuery}}`);
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return empty String', () => {

      const template = Handlebars.compile(`{{#eachSubSectionQuery 'index' sectionsNotAvailable}} {{sectionName}} {{/eachSubSectionQuery}}`);
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return Section Overview', () => {

      const template = Handlebars.compile(`{{#eachSubSectionQuery 'index' sections}} {{sectionName}} {{/eachSubSectionQuery}}`);
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual(' Overview ');
    });

    it('should return Font Section with one subsections', () => {

      const template = Handlebars.compile(`{{#eachSubSectionQuery 'Fonts' sections}} {{sectionName}}\n{{/eachSubSectionQuery}}`);
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual(' Fonts\n Webfonts\n');
    });

    it('should return Controls Section with all subsections', () => {

      const template = Handlebars.compile(`{{#eachSubSectionQuery 'Controls' sections}} {{sectionName}}\n{{/eachSubSectionQuery}}`);
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual(' Controls\n Button\n ButtonSmall\n Dropdown\n');
    });

  });

  describe('{{#ifLevel lowerBound upperBound options}} {{/ifLevel}}', () => {

    it('should return empty string', () => {

      const section = {
        level: 0
      };

      const template = Handlebars.compile(`{{#ifLevel '0' '1'}} {{sectionName}} {{/ifLevel}}`);
      const renderedHTML = template(section);
      expect(renderedHTML).toEqual('');
    });

    it('should return sectionName', () => {

      const section = {
        level: 1,
        sectionName: 'Control'
      };

      const template = Handlebars.compile(`{{#ifLevel '1'}} {{sectionName}} {{/ifLevel}}`);
      const renderedHTML = template(section);
      expect(renderedHTML).toEqual(' Control ');
    });

    it('should return sectionName', () => {

      const section = {
        level: 2,
        sectionName: 'Control'
      };

      const template = Handlebars.compile(`{{#ifLevel '1' '2'}} {{sectionName}} {{/ifLevel}}`);
      const renderedHTML = template(section);
      expect(renderedHTML).toEqual(' Control ');
    });

  });

  describe('{{#eachVariation}} {{/eachVariation}}', () => {

    it('should return empty String (no context)', () => {

      const template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
      const renderedHTML = template({});
      expect(renderedHTML).toEqual('');
    });

    it('should return empty String (no variations in context', () => {

      const template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual('');
    });

    it('should return one variation', () => {

      context.variations = [
        {
          variationName: '.test-class',
          variationDescription: 'testmodifier',
          variationClass: ['test-class']
        }
      ];

      const template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}} {{/eachVariation}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual(' .test-class,testmodifier,test-class ');
    });

    it('should return two variation', () => {

      context.variations = [
        {
          variationName: '.test-class',
          variationDescription: 'testmodifier',
          variationClass: ['test-class']
        },
        {
          variationName: '.test-class2',
          variationDescription: 'testmodifier2',
          variationClass: ['test-class2']
        }
      ];

      const template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}}\n {{/eachVariation}}');
      const renderedHTML = template(context);
      expect(renderedHTML).toEqual(' .test-class,testmodifier,test-class\n .test-class2,testmodifier2,test-class2\n');
    });

  });

});
