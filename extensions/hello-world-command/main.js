/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const pebeny = require('../../custom_modules/pebeny');

console.log('hello-world-command Start');

pebeny.commands.registerCommand('extension.helloWorld.dosome', () => {
  console.log('hello-world-command dosome by command');
});

console.log('hello-world-command End');
