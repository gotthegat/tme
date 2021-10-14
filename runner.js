const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const render = require("./render");

const forbiddenDirs = ["node_modules"];

class Runner {
  constructor() {
    this.testFiles = [];
  }

  async runTest() {
    for (let file of this.testFiles) {
      console.log(chalk.gray(`---- ${file.shortName}`));

      const beforeEaches = [];
      global.render = render;
      global.beforeEach = (func) => {
        beforeEaches.push(func);
      };
      global.it = async (desc, func) => {
        beforeEaches.forEach((func) => func());
        try {
          await func();
          console.log(chalk.green(`\tOK - ${desc}`));
        } catch (err) {
          const message = err.message.replace(/\n/g, "\n\t\t");
          console.log(chalk.red(`\tX - ${desc}`));
          console.log(chalk.red("\t", message));
        }
      };
      try {
        require(file.name); // run the file
      } catch (err) {
        console.log(chalk.red(err));
      }
    }
  }

  async collectFiles(targetPath) {
    const files = await fs.promises.readdir(targetPath);

    for (let file of files) {
      const filePath = path.join(targetPath, file);
      const stats = await fs.promises.lstat(filePath);

      if (stats.isFile() && file.includes(".test.js")) {
        this.testFiles.push({ name: filePath, shortName: file });
      } else if (stats.isDirectory() && !forbiddenDirs.includes(file)) {
        const childFiles = await fs.promises.readdir(filePath);

        files.push(...childFiles.map((f) => path.join(file, f)));
      }
    }
  }
}

module.exports = Runner;
