import * as commentsParser from '../scripts/finderParser/commentsParser';

describe('parsing of comments', () => {

  let sections;
  let createdTestSection;

  beforeEach(() => {
    sections = {
      level: 0
    };
  });

  describe('a single line comment', () => {
    beforeEach(() => {
      const minimalComment = {
        comment: '/* Just a Comment */',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(minimalComment, sections);
    });

    it('should be ignored', () => {
      expect(createdTestSection).toBe(-1);
    });
  });

  describe('a minimal comment', () => {
    beforeEach(() => {
      const minimalComment = {
        comment: '/*\nTitle \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(minimalComment, sections);
    });

    it('should create a section object', () => {
      expect(createdTestSection).not.toEqual(-1);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a srcPath', () => {
      expect(createdTestSection.srcPath).toEqual('doesNotExist/pathIsJustForTesting');
    });
  });

  describe('a comment with description', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });
  });

  describe('a comment with multi line description', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3 \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });
  });

  describe('a comment with hbs file as markup', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

  });

  describe('a comment with multiline html as markup', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: <div><p>first line</p>\n<span>second line</span></div>\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('<div><p>first line</p>\n<span>second line</span></div>');
    });

  });

  describe('a comment with one variation class', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class - Variation Description \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have a variation', () => {
      expect(createdTestSection.variations).toEqual([{
        variationName: '.test-class',
        variationDescription: 'Variation Description',
        variationClass: ['test-class']
      }]);
    });
  });

  describe('a comment with multiple variation classes', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n.test-class - Variation Description\n.test-class2.test-class--modifier - Variation Description2 \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have variations', () => {
      expect(createdTestSection.variations).toEqual([
        {
          variationName: '.test-class',
          variationDescription: 'Variation Description',
          variationClass: ['test-class']
        },
        {
          variationName: '.test-class2.test-class--modifier',
          variationDescription: 'Variation Description2',
          variationClass: ['test-class2', 'test-class--modifier']
        }
      ]);
    });
  });

  describe('a comment with variation classes and states (hover, focus) in one line', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class2.test-class--modifier - Variation Description2\n:focus.test-class3 - focusState \n.test-class2.test-class--modifier:active - Variation Description2   \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });
    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });
    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });
    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have variations with states', () => {
      expect(createdTestSection.variations).toEqual([
        {
          variationName: '.test-class2.test-class--modifier',
          variationDescription: 'Variation Description2',
          variationClass: ['test-class2', 'test-class--modifier']
        },
        {
          variationName: ':focus.test-class3',
          variationDescription: 'focusState',
          variationClass: ['pseudo-class-focus', 'test-class3']
        },
        {
          variationName: '.test-class2.test-class--modifier:active',
          variationDescription: 'Variation Description2',
          variationClass: ['test-class2', 'test-class--modifier', 'pseudo-class-active']
        }
      ]);
    });
  });

  describe('a comment with one variation and variation classes with states (hover, focus) in one line', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class - Variation Description\n:hover - hoverState\n.test-class2.test-class--modifier - Variation Description2\n:focus.test-class3 - focusState \n.test-class2.test-class--modifier:active - Variation Description2   \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });
    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });
    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });
    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have variations with states', () => {
      expect(createdTestSection.variations).toEqual([
        { variationName: '.test-class', variationDescription: 'Variation Description', variationClass: ['test-class'] },
        { variationName: ':hover', variationDescription: 'hoverState', variationClass: ['pseudo-class-hover'] },
        {
          variationName: '.test-class2.test-class--modifier',
          variationDescription: 'Variation Description2',
          variationClass: ['test-class2', 'test-class--modifier']
        },
        {
          variationName: ':focus.test-class3',
          variationDescription: 'focusState',
          variationClass: ['pseudo-class-focus', 'test-class3']
        },
        {
          variationName: '.test-class2.test-class--modifier:active',
          variationDescription: 'Variation Description2',
          variationClass: ['test-class2', 'test-class--modifier', 'pseudo-class-active']
        }
      ]);
    });
  });

  describe('a comment with one variation consists of classes and state', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\nDescription Line 2\nLine 3\nMarkup: test.hbs\n\n.test-class.test-class2:hover - Variation Description \n\n:hover - hoverState\n:focus - focusState   \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });
    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });
    it('should have a multi line description', () => {
      expect(createdTestSection.description).toEqual('A Test Description  \nDescription Line 2  \nLine 3');
    });
    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have variations with states', () => {
      expect(createdTestSection.variations).toEqual([{
        variationName: '.test-class.test-class2:hover',
        variationDescription: 'Variation Description',
        variationClass: ['test-class', 'test-class2', 'pseudo-class-hover']
      }, {
        variationClass: ['pseudo-class-hover'],
        variationDescription: 'hoverState',
        variationName: ':hover'
      }, {
        variationClass: ['pseudo-class-focus'],
        variationDescription: 'focusState',
        variationName: ':focus'
      }
      ]);
    });
  });

  describe('a comment with property wrapper-classes', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n\nwrapper-classes: background-dark \n\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have a property wrapper-classes', () => {
      expect(createdTestSection.properties).toEqual(
        {
          'wrapper-classes': ['background-dark']
        }
      );
    });
  });

  describe('a comment with multiple property', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have properties', () => {
      expect(createdTestSection.properties).toEqual(
        {
          'wrapper-classes': ['background-dark', 'min-height', 'overflow'],
          'weight': ['-12']
        }
      );
    });
  });

  describe('a comment with markup, variations, states and properties', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\n\nMarkup: test.hbs\n.test-class - Variation Description\n.test-class2 - Variation Description2\n:hover - hoverState\n:focus - focusState \n\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

    it('should have a markup', () => {
      expect(createdTestSection.markup).toEqual('test.hbs');
    });

    it('should have variations with states', () => {
      expect(createdTestSection.variations).toEqual([
        { variationName: '.test-class', variationDescription: 'Variation Description', variationClass: ['test-class'] },
        { variationName: '.test-class2', variationDescription: 'Variation Description2', variationClass: ['test-class2'] },
        { variationName: ':hover', variationDescription: 'hoverState', variationClass: ['pseudo-class-hover'] },
        { variationName: ':focus', variationDescription: 'focusState', variationClass: ['pseudo-class-focus'] }
      ]);
    });

    it('should have properties', () => {
      expect(createdTestSection.properties).toEqual(
        {
          'wrapper-classes': ['background-dark', 'min-height', 'overflow'],
          'weight': ['-12']
        }
      );
    });
  });

  describe('a comment with only title, name and property', () => {

    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle  \nWeight: -12 \nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a property', () => {
      expect(createdTestSection.properties).toEqual(
        { weight: ['-12'] }
      );
    });
  });

  describe('a comment with angular-markup, variations, states and angular-properties', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\nangular-markup: test.html\n\n.test-class - Variation Description\n.test-class2 - Variation Description2\n:hover - hoverState\n:focus - focusState \n\nangular-wrapper: test,test\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

    /*
     cannot be tested here because the test.html sourcefile does not exist
     it('should have a angular-markup', () =>
     {
         createdTestSection.should.have.property('angularMarkup');
     });*/

    it('should have variations with states', () => {
      expect(createdTestSection.variations).toEqual([
        { variationName: '.test-class', variationDescription: 'Variation Description', variationClass: ['test-class'] },
        { variationName: '.test-class2', variationDescription: 'Variation Description2', variationClass: ['test-class2'] },
        { variationName: ':hover', variationDescription: 'hoverState', variationClass: ['pseudo-class-hover'] },
        { variationName: ':focus', variationDescription: 'focusState', variationClass: ['pseudo-class-focus'] }
      ]);
    });

    it('should have properties', () => {
      expect(createdTestSection.properties).toEqual(
        {
          'angular-wrapper': ['test', 'test'],
          'wrapper-classes': ['background-dark', 'min-height', 'overflow'],
          'weight': ['-12']
        }
      );
    });
  });

  describe('a comment with angular-markup,angular-properties', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\nangular-markup: test.html\n\nangular-wrapper: test,test\nwrapper-classes: background-dark, min-height , overflow \nWeight: -12  \n\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

    /*
     cannot be tested here because the test.html sourcefile does not exist
     it('should have a angular-markup', () =>
     {
     createdTestSection.should.have.property('angularMarkup');
     });*/

    it('should have properties', () => {
      expect(createdTestSection.properties).toEqual(
        {
          'angular-wrapper': ['test', 'test'],
          'wrapper-classes': ['background-dark', 'min-height', 'overflow'],
          'weight': ['-12']
        }
      );
    });
  });

  describe('a comment with angular-markup', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\nangular-markup: test.html\n\nStyleguide testSection \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('testsection');
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

  });

  describe('a comment in a sub-section', () => {
    beforeEach(() => {
      const commentWithDescription = {
        comment: '/*\nTitle\nA Test Description\n\nangular-markup: test.html\n\nStyleguide testSection.sectionABC \n*/',
        srcPath: 'doesNotExist/pathIsJustForTesting'
      };
      createdTestSection = commentsParser.getSectionObjectOfComment(commentWithDescription, sections);
    });

    it('should have a title', () => {
      expect(createdTestSection.sectionTitle).toEqual('Title');
    });

    it('should have a sectionName', () => {
      expect(createdTestSection.sectionName).toEqual('sectionabc');
    });

    it('should be level 2', () => {
      expect(createdTestSection.level).toBe(2);
    });

    it('should have a description', () => {
      expect(createdTestSection.description).toEqual('A Test Description');
    });

  });
});
