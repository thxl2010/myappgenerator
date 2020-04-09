/*
 * @Author: Duyb
 * @Date: 2020-04-03 13:28:39
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-04-09 13:51:46
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
const GLOSSARY_URL_PRE = 'https://www.pharma-mkting.com/glossary/?name_directory_startswith=';
const GLOSSARY_URL = `${GLOSSARY_URL_PRE}%23`;
let LETTER_LIST = [];
const PAGE_LIST = []; // https://www.pharma-mkting.com/glossary/?name_directory_startswith=A
const GLOSSARY_MAP = {}; // { letter: [{ letter, key, content }] }

var ep = new eventproxy();

function init(req, res, next) {
  superagent.get(GLOSSARY_URL).end(function(err, pres) {
    var $ = cheerio.load(pres.text);
    $('.name_directory_index a').each(function(i, item) {
      var letter = $(item)
        .text()
        .charAt(0);
      if (letter !== '#') {
        LETTER_LIST.push(letter);
        PAGE_LIST.push(`${GLOSSARY_URL_PRE}${letter}`);
      }
    });
    console.log('LETTER_LIST : ', JSON.stringify(LETTER_LIST));
    getByLetters();
  });
}
exports.index = init;

function getByLetters() {
  LETTER_LIST.forEach(function(letter) {
    GLOSSARY_MAP[letter] = [];

    (function(letter) {
      setTimeout(function() {
        const pageUrl = `${GLOSSARY_URL_PRE}${letter}`;
        superagent.get(pageUrl).end(function(err, pres) {
          // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
          // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
          // 剩下就都是利用$ 使用 jquery 的语法了
          var $ = cheerio.load(pres.text);

          $('.name_directory_column .name_directory_name_box').each(function(idx, element) {
            var $element = $(element); // 关键词
            var $key = $element.find('strong'); // 关键词
            var key = $key.text().trim();
            var $content = $key.next().next();
            var content = $content.text().trim();

            var $hrefs = $content.find('a');
            $hrefs.each(function(j, ele) {
              var $href = $(ele);
              var href = $href.attr('href');
              var hrefName = $href.text();
              if (href && hrefName) {
                content = content.replace(`${hrefName}`, `[${hrefName}](${href})`);
              }
            });

            const co = {
              letter,
              key,
              content,
            };
            GLOSSARY_MAP[letter].push(co);
          });

          // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
          console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>  ${letter} \n`, GLOSSARY_MAP[letter]);
          ep.emit('BlogArticleHtml', GLOSSARY_MAP[letter]);
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
    setTimeout(() => {
      // console.log('all GLOSSARY_MAP :', JSON.stringify(GLOSSARY_MAP));
      // console.log('\n\n\n <<<<<<<<<<<<<<<<<<<<<<<<< finish get');
      append2Json('pharma-mkting', GLOSSARY_MAP);
      Object.entries(GLOSSARY_MAP).forEach((item) => {
        append2Json(item[0], item[1]);
        json2Csv('pharma-mkting', item[1]);
        json2Csv(item[0], item[1]);
      });
    }, 10000);
  });
}

function append2Json(name, value) {
  fs.appendFile(`./pharma-mkting/${name}-glossary.json`, JSON.stringify(value), 'utf8', (err) => {
    if (err) {
      console.log('json 写入失败', err);
    } else {
      console.log('json 写入成功');
    }
  });
}

function append2Csv(path, value) {
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
    append2Csv(`./pharma-mkting/${name}-glossary.csv`, csv);
  } catch (err) {
    // console.error(`^^^^^^^^^^^^^^^^^^^^^^^  json2Csv err: ${err}`);
  }
}

init();
