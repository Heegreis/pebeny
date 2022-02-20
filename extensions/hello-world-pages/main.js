/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const pebeny = require('../../custom_modules/pebeny');

console.log('hello-world-pages Start');

pageFilePath = 'pages/index.html';
pebeny.electronKitCreateWindow(pageFilePath);

console.log('hello-world-pages End');
