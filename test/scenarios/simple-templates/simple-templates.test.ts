import { startGeneration } from '../../../scripts/uxLibraryGenerator';
import * as fsExtra from 'fs-extra';
import { compare, compareSync, Options } from 'dir-compare';

// to cope with assemble tests
jest.useFakeTimers();
jest.setTimeout(15000);

const generatedFilePath = 'test/scenarios/simple-templates/.generated';
const expectedPath = 'test/scenarios/simple-templates/expected';
describe('generated should match expected', () => {

  beforeAll((done) => {
    // remove the files
    fsExtra.removeSync(generatedFilePath);
    // start a generation
    startGeneration('test/scenarios/simple-templates/fixture', 'src/ux-library/ux-library-config.json', done);
  });

  it('generated files should exist', () => {
    expect(fsExtra.existsSync(generatedFilePath)).toBeTruthy();
  });

  it('files should match expected', () => {

    const options: Partial<Options> = { compareSize: true, compareContent: true };
    const states = { equal: '==', left: '->', right: '<-', distinct: '<>' };
    return compare(expectedPath, generatedFilePath, options)
      .then((result) => {
        let differences = '';
        result.diffSet.forEach((entry) => {
          const state = states[entry.state];
          const name1 = entry.name1 ? entry.name1 : '';
          const name2 = entry.name2 ? entry.name2 : '';
          differences += `${name1}(${entry.type1}) ${state} ${name2}(${entry.type2})\r\n`;
        });
        if (result.differences > 0) {
          console.warn(`Differences: \r\n${differences}`);
        }
        expect(result.differences).toBe(0);
      });
  });
});
