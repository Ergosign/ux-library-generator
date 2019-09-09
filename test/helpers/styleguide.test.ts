import * as Handlebars from 'handlebars';

// Local helpers
import { registerHandlebarsHelpersMarkup } from '../../scripts/handlebarsHelpers/markupHelpers';
registerHandlebarsHelpersMarkup(Handlebars, {});
import { registerHandlebarsHelpersStyleguide } from '../../scripts/handlebarsHelpers/styleguideHelpers';
registerHandlebarsHelpersStyleguide(Handlebars);


describe('Styleguide Helper Tests', function () {

    let context;

    beforeEach(function () {

        context = {};
    });


    describe('{{#eachSectionRoot rootSections options}} {{/eachSectionRoot}}', function () {

        it('should return empty String', function () {
            let template = Handlebars.compile('{{#eachSectionRoot }} {{sectionName}} {{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual('');
        });

        it('should return empty String', function () {
            let undefinedSection;
            context['sections'] = undefinedSection;
            let template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual('');
        });

        it('should return empty String', function () {
            let subSections = {
                level: 1
            };

            context['sections'] = subSections;
            let template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual('');
        });

        it('should return empty String', function () {
            let emptySections = {
                level: 0
            };
            context['sections'] = emptySections;
            let template = Handlebars.compile('{{#eachSectionRoot sections}} {{sectionName}} {{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual('');
        });

        it('should return output for 1 subsections', function () {
            let testSection = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionDescription: "more items"
                }
            };

            context['sections'] = testSection;
            let template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual("Overview, more items\n");
        });

        it('should return output for 2 subsections', function () {
            let testSection = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionDescription: "more items"
                },
                Controls: {
                    level: 1,
                    sectionName: "Controls",
                    sectionDescription: "control items"
                }
            };

            context['sections'] = testSection;
            let template = Handlebars.compile('{{#eachSectionRoot sections}}{{sectionName}}, {{sectionDescription}}\n{{/eachSectionRoot}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual("Overview, more items\nControls, control items\n");
        });

    });

    //TODO ifREferenceOfSection is never true in our context
    /*describe('{{#ifReferenceOfSection sectionName options}} {{/ifReferenceOfSection}}', function () {

     beforeEach(function () {

     context = {
     level: 0,
     index: {
     level: 1,
     sectionName: "Overview",
     sectionDescription: "more items"
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


    describe('{{#eachSubSectionQuery query sections options}} {{/eachSectionQuery}}', function () {

        beforeEach(function () {
            let testSections = {
                level: 0,
                index: {
                    level: 1,
                    sectionName: "Overview",
                    sectionTitle: "index",
                    sectionDescription: "more items"
                },
                Fonts: {
                    level: 2,
                    sectionName: "Fonts",
                    sectionTitle: "Fonts",
                    sectionDescription: "font descr",
                    WebFonts: {
                        level: 2,
                        sectionName: "Webfonts",
                        sectionTitle: "Webfonts",
                        sectionDescripton: "webfonts descr"
                    }
                },
                Controls: {
                    level: 1,
                    sectionName: "Controls",
                    sectionTitle: "Contorls",
                    sectionDescription: "control items",
                    Button: {
                        level: 2,
                        sectionName: "Button",
                        sectionTitle: "Button",
                        sectionDescription: "button descr",
                        ButtonSmall: {
                            level: 3,
                            sectionTitle: "ButtonSmall",
                            sectionName: "ButtonSmall",
                            sectionDescription: "ButtonSmall"
                        }
                    },
                    Dropdown: {
                        level: 2,
                        sectionName: "Dropdown",
                        sectionTitle: "Dropdown",
                        sectionDescription: "dropdown desrc"
                    }
                }
            };
            context['sections'] = testSections;
        });

        it('should return empty String', function () {

            let template = Handlebars.compile('{{#eachSubSectionQuery "NamenotInList" sections}} {{sectionName}} {{/eachSubSectionQuery}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual("");
        });

        it('should return empty String', function () {

            let template = Handlebars.compile('{{#eachSubSectionQuery "index" sectionsNotAvailable}} {{sectionName}} {{/eachSubSectionQuery}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual("");
        });

        it('should return Section Overview', function () {

            let template = Handlebars.compile('{{#eachSubSectionQuery "index" sections}} {{sectionName}} {{/eachSubSectionQuery}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual(" Overview ");
        });

        it('should return Font Section with one subsections', function () {

            let template = Handlebars.compile('{{#eachSubSectionQuery "Fonts" sections}} {{sectionName}}\n{{/eachSubSectionQuery}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual(" Fonts\n Webfonts\n");
        });

        it('should return Controls Section with all subsections', function () {

            let template = Handlebars.compile('{{#eachSubSectionQuery "Controls" sections}} {{sectionName}}\n{{/eachSubSectionQuery}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual(" Controls\n Button\n ButtonSmall\n Dropdown\n");
        });

    });

    describe('{{#ifLevel lowerBound upperBound options}} {{/ifLevel}}', function () {

        it('should return empty string', function () {

            let section = {
                level: 0
            };

            let template = Handlebars.compile('{{#ifLevel "0" "1"}} {{sectionName}} {{/ifLevel}}');
            let renderedHTML = template(section);
            expect(renderedHTML).toEqual('');
        });

        it('should return sectionName', function () {

            let section = {
                level: 1,
                sectionName: "Control"
            };

            let template = Handlebars.compile('{{#ifLevel "1"}} {{sectionName}} {{/ifLevel}}');
            let renderedHTML = template(section);
            expect(renderedHTML).toEqual(' Control ');
        });

        it('should return sectionName', function () {

            let section = {
                level: 2,
                sectionName: "Control"
            };

            let template = Handlebars.compile('{{#ifLevel "1" "2"}} {{sectionName}} {{/ifLevel}}');
            let renderedHTML = template(section);
            expect(renderedHTML).toEqual(' Control ');
        });

    });

    describe('{{#eachVariation}} {{/eachVariation}}', function () {

        it('should return empty String (no context)', function () {

            let template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
            let renderedHTML = template({});
            expect(renderedHTML).toEqual('');
        });

        it('should return empty String (no variations in context', function () {

            let template = Handlebars.compile('{{#eachVariation}} {{variationName}} {{/eachVariation}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual('');
        });

        it('should return one variation', function () {

            context['variations'] = [
                {
                    variationName: ".test-class",
                    variationDescription: "testmodifier",
                    variationClass: ["test-class"]
                }
            ];

            let template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}} {{/eachVariation}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual(' .test-class,testmodifier,test-class ');
        });

        it('should return two variation', function () {

            context['variations'] = [
                {
                    variationName: ".test-class",
                    variationDescription: "testmodifier",
                    variationClass: ["test-class"]
                },
                {
                    variationName: ".test-class2",
                    variationDescription: "testmodifier2",
                    variationClass: ["test-class2"]
                }
            ];

            let template = Handlebars.compile('{{#eachVariation}} {{variationName}},{{variationDescription}},{{variationClass}}\n {{/eachVariation}}');
            let renderedHTML = template(context);
            expect(renderedHTML).toEqual(' .test-class,testmodifier,test-class\n .test-class2,testmodifier2,test-class2\n');
        });

    });

});
