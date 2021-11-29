const { readdir, readFile, writeFileSync } = require("fs");
const { resolve } = require("path");

const logsFolder = 'd:/git/CryofallMod/Data/Logs';
const outputFolder = '../src/assets/json';

readdir(logsFolder, (err, files) => {
  if (err) {
    console.log(`error reading directory: ${logsFolder}`);
    console.error(err);
    return;
  }

  files = files.filter(file => file.indexOf('Client') >= 0);
  const file = files.sort().pop();

  // files.forEach(file => console.log(file));

  const fullPath = resolve(logsFolder, file);
  console.log('fullPath:', fullPath);

  readFile(fullPath, (err, buff) => {
    // if any error
    if (err) {
      console.log('Error reading file:', fullPath);
      console.error(err);
      return;
    }
  
    const s = buff.toString();
    const lines = s.split(/\r?\n/);
    const sections = {};

    const beginRx = /<---------- BEGIN ([a-zA-Z]+) ---------->/;
    const endRx = /<---------- END ([a-zA-Z]+) ---------->/;
    lines.forEach((line, index) => {
      const mBegin = line.match(beginRx);
      if (mBegin && mBegin.length > 1) {
        sections[mBegin[1]] = { firstLine: index + 1 };
      }

      const mEnd = line.match(endRx);
      if (mEnd && mEnd.length > 1 && sections[mEnd[1]]) {
        sections[mEnd[1]].lastLine = index - 1;
      }
    });

    console.log('sections:');
    console.log(sections);

    Object.keys(sections).forEach(key => {
      const {firstLine, lastLine } = sections[key];
      
      const fullTextPath = resolve(outputFolder, `${key}.text`);
      const text = lines.slice(firstLine, lastLine + 1).join('\r\n');
      writeFileSync(fullTextPath, text, 'utf8');

      const fullJsonPath = resolve(outputFolder, `${key}.json`);
      const json = JSON.stringify(JSON.parse(text), null, 2);
      writeFileSync(fullJsonPath, json, 'utf8');
    })
  });
})