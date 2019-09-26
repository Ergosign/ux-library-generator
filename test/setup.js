global.console = {
  log: jest.fn(), // console.log are ignored in tests

  // Keep native behavior for other methods, use those to print out things in your own tests, not `console.log`
  error: console.error,
  warn: console.warn,
  info: jest.fn(),
  debug: console.debug,
  dir: jest.fn()
};
