/* eslint-disable no-console */
const NO_COVERAGE = process.env.NO_COVERAGE === '1';
const CLEAR_CONSOLE = process.env.CLEAR_CONSOLE === '1';

const notice = () => console.log('Using Jest config from `jest.config.js`');

if (CLEAR_CONSOLE) {
  // eslint-disable-next-line global-require,import/no-unresolved
  require('clear')();
  console.log();
  notice();
  console.log('Clearing console due to CLEAR_CONSOLE=1');
} else {
  notice();
}

if (NO_COVERAGE) {
  console.log('Coverage not collected due to NO_COVERAGE=1');
}

console.log('Type checking is disabled during Jest for performance reasons, use `jest typecheck` when necessary.');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
