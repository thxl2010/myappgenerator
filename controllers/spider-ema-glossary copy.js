/*
 * @Author: Duyb
 * @Date: 2020-04-03 13:28:39
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-04-03 18:02:24
 */
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
// var async = require('async'); // 并发连接数控制
var eventproxy = require('eventproxy');
const { parse } = require('json2csv');
const fields = ['letter', 'key', 'content'];
const opts = { fields };

// ema Glossary
const GLOSSARY_URL = 'https://www.ema.europa.eu/en/about-us/about-website/glossary/';
const LETTER_LIST = [];
const LETTER_LIST2 = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'L',
  'M',
  'N',
  'O',
  'P',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
];
const PAGE_LIST = []; // https://www.ema.europa.eu/en/about-us/about-website/glossary/name_az/A
const GLOSSARY_MAP = {}; // { letter: [{ letter, key, content }] }

var ep = new eventproxy();

function init(req, res, next) {
  superagent.get(GLOSSARY_URL).end(function(err, pres) {
    var $ = cheerio.load(pres.text);
    $('.ecl-form-label a').each(function(i, item) {
      var letter = $(item)
        .text()
        .charAt(0);
      LETTER_LIST.push(letter);
      PAGE_LIST.push(`${GLOSSARY_URL}${letter}`);
    });
    console.log('getByLetters LETTER_LIST : ', JSON.stringify(LETTER_LIST));
    getByLetters();
  });
}
exports.index = init;

function getByLetters() {
  LETTER_LIST.forEach(function(letter) {
    GLOSSARY_MAP[letter] = [];

    (function(letter) {
      setTimeout(function() {
        const pageUrl = `${GLOSSARY_URL}name_az/${letter}`;
        superagent.get(pageUrl).end(function(err, pres) {
          // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
          // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
          // 剩下就都是利用$ 使用 jquery 的语法了
          var $ = cheerio.load(pres.text);

          $('.views-field-name').each(function(idx, element) {
            var $key = $(element); // 关键词
            var key = $key.text().trim();
            var $content = $key.next();
            var content = $content.text().trim();

            var $hrefs = $content.find('a');
            $hrefs.each(function(j, ele) {
              var $href = $(ele);
              var href = $href.attr('href').trim();
              var hrefName = $href.text().trim();
              content = content.replace(`'${hrefName}'`, `[${hrefName}](${href})`);
              console.log('>>>>>>>>>>>>>>>>>>>>>>> ', key, hrefName, href, content);
            });

            GLOSSARY_MAP[letter].push({
              letter,
              key,
              content,
            });

            // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
            ep.emit('BlogArticleHtml', content);
          });
        });
      }, 1000 * 60);
    })(letter);
  });

  // 命令 ep 重复监听 LETTER_LIST.length 次 `BlogArticleHtml` 事件再行动
  ep.after('BlogArticleHtml', LETTER_LIST.length, function(content) {
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    console.log('******************* ep.after ********************');
    // console.log('content : ', content);
    // console.log('GLOSSARY_MAP : ', GLOSSARY_MAP);
    append2Json(GLOSSARY_MAP);
    Object.entries(GLOSSARY_MAP).forEach((item) => {
      json2Csv(item[0], item[1]);
    });
  });
}

function append2Json(value) {
  fs.writeFileSync('./glossary.json', JSON.stringify(value));
}

function append2Csv(path, value) {
  fs.writeFile(path, value, 'utf8', (err) => {
    if (err) {
      console.log('写入失败');
    } else {
      console.log('写入成功');
    }
  });
}

function json2Csv(name, data) {
  try {
    const csv = parse(data, opts);
    console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^ json2Csv csv : ${csv}`);
    append2Csv(`./controllers/csv/${name}-glossary.csv`, csv);
  } catch (err) {
    console.error(`^^^^^^^^^^^^^^^^^^^^^^^  json2Csv err: ${err}`);
  }
}

init();
