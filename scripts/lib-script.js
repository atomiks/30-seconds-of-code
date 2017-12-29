/*
  Builds the `Snippet` module library.
*/
const fs = require('fs-extra');
const cp = require('child_process');
const path = require('path');
const chalk = require('chalk');

const SNIPPETS_PATH = './snippets';
const TEMP_PATH = './temp';
const IMPORTS = './imports.js'

const codeRE = /```\s*js([\s\S]*?)```/;

const tagDatad = fs.readFileSync('tag_database','utf8');

console.time('Lib');

try {
  const snippets = fs.readdirSync(SNIPPETS_PATH)
    .sort((a, b) => a.toLowerCase() - b.toLowerCase())
    // turn it into an object so we can add data to it to be used in a different scope
    .map(name => ({ name }));

  if (!fs.existsSync(TEMP_PATH)) {
    fs.mkdirSync(TEMP_PATH);
  }

  fs.writeFileSync(IMPORTS, '');

  let exportStr = 'export default {';

  for (const snippet of snippets) {
    const snippetData = fs.readFileSync(path.join(SNIPPETS_PATH, snippet.name), 'utf8')
    const snippetName = snippet.name.replace('.md', '');

    const category = tagDatad.slice(tagDatad.indexOf(snippetName) + snippetName.length+1).split('\n')[0].includes('node');

    if (!category) {
      const importData = fs.readFileSync(IMPORTS);
      fs.writeFileSync(IMPORTS, importData + `\nimport { ${snippetName} } from './temp/${snippetName}.js'`);
      exportStr += `${snippetName},`

      fs.writeFileSync(
        `${TEMP_PATH}/${snippetName}.js`,
        'export ' + snippetData.match(codeRE)[1].replace('\n', '')
      );
    }
  }

  exportStr += '}';

  const importData = fs.readFileSync(IMPORTS);
  fs.writeFileSync(IMPORTS, importData + `\n${exportStr}`);

  cp.exec('rollup -c scripts/rollup.js', {}, (err, stdout, stderr) => {
    fs.removeSync(TEMP_PATH);
    fs.unlink(IMPORTS);
    console.log(`${chalk.green('SUCCESS!')} Snippet module built!`);
    console.timeEnd('Lib');
  })
} catch (err) {
  console.log(`${chalk.red('ERROR!')} During module creation: ${err}`);
  process.exit(1);
}
