import { compare, Options } from 'dir-compare';

export async function checkDirectoriesMatch(expectedPath: string, generatedFilePath: string) {
  const options: Partial<Options> = {
    compareSize: true,
    compareContent: true,
    excludeFilter: 'search-index.json' // we exclude this file as it has a timestamp inside which makes compare hard.
  };
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
}
