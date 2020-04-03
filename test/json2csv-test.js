var fs = require('fs');
const { Parser } = require('json2csv');

const fields = ['letter', 'key', 'content'];
const opts = { fields };
const myData = {
  C: [
    {
      key: 'cj',
      content: 'hello'
    },
    {
      key: 'China',
      content: 'hello China'
    }
  ],
  D: [
    {
      key: 'du',
      content: 'hello'
    }
  ]
};

const myData2 = [
  {
    letter: 'C',
    key: 'cj',
    content: 'hello'
  },
  {
    letter: 'C',
    key: 'China',
    content: 'hello China'
  },
  {
    letter: 'D',
    key: 'du',
    content: 'hello'
  }
]

try {
  const parser = new Parser(opts);
  const csv = parser.parse(myData2);
  console.log('csv :', csv);
  append2Csv(csv);
} catch (err) {
  console.error('err :', err);
}


function append2Csv(value) {
  fs.writeFile('./test/append2Csv-test.csv', value, 'utf8', (err) => {
    if (err) {
      console.log('写入失败');
    } else {
      console.log('写入成功');
    }
  });
}
