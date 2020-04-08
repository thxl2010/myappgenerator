var fs = require('fs');
const { parse } = require('json2csv');
const fields = ['letter', 'key', 'content'];
const opts = { fields };

const GLOSSARY_MAP = require('./exports/pharmaceutical-drug-manufacturers1-glossary-all.json');
// console.log(JSON.stringify(GLOSSARY_MAP));

function append2Csv(path, value) {
  // console.log(path, value);
  fs.appendFile(path, value, 'utf8', (err) => {
    if (err) {
      // console.log('csv 写入失败', err);
    } else {
      // console.log('csv 写入成功');
    }
  });
}

function json2Csv(name, data) {
  try {
    const csv = parse(data, opts);
    // console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^ json2Csv name : ${name} , csv : ${csv}`);
    append2Csv(`./exports/${name}-glossary.csv`, csv);
  } catch (err) {
    // console.error(`^^^^^^^^^^^^^^^^^^^^^^^  json2Csv err: ${err}`);
  }
}

function add() {
  arr = [];
  Object.entries(GLOSSARY_MAP).forEach((item, i) => {
    // append2Json(item[0], item[1]);
    // console.log(`\n >>>>>>>>>>>> \n ${i} item[1]`, JSON.stringify(item[1]));
    json2Csv('pharmaceutical-drug-manufacturers1-glossary-all', item[1]);
  });
}

add();
