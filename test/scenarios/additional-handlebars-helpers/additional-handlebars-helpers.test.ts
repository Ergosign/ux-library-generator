import { startGeneration } from '../../../scripts/uxLibraryGenerator';
import * as fsExtra from 'fs-extra';
import { checkDirectoriesMatch } from '../../util/testCompareFiles';

// to cope with assemble tests
jest.useFakeTimers();
jest.setTimeout(15000);

const testFolder = 'test/scenarios/additional-handlebars-helpers';
const generatedFilePath = `${testFolder}/.generated`;
const expectedPath = `${testFolder}/expected`;
const fixturePath = `${testFolder}/fixture`;
describe('generated should match expected', () => {

  beforeAll((done) => {
    // remove the files
    fsExtra.removeSync(generatedFilePath);
    // start a generation
    startGeneration(fixturePath, 'src/ux-library/ux-library-config.json', done);
  });

  it('generated files should exist', () => {
    expect(fsExtra.existsSync(generatedFilePath)).toBeTruthy();
  });

  it('files should match expected', (done) => {
    checkDirectoriesMatch(expectedPath, generatedFilePath).then(() => {
      done();
    });
  });
});
