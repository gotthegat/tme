#!/usr/bin/env node

const Runner = require("./runner");
const runner = new Runner();

const run = async () => {
  await runner.collectFiles(process.cwd()); // current working directory
  // console.log(runner.testFiles);
  runner.runTest();
};

run();
