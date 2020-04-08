/*
 * @Author: Duyb
 * @Date: 2020-04-03 13:28:39
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-04-09 00:24:34
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
const GLOSSARY_URL_PRE = 'http://www.pharmaceutical-drug-manufacturers.com/pharmaceutical-glossary/glossary-of-terms'; // .html
const GLOSSARY_URL = `${GLOSSARY_URL_PRE}.html`;
let LETTER_LIST = [];
const PAGE_LIST = []; // http://www.pharmaceutical-drug-manufacturers.com/pharmaceutical-glossary/glossary-of-terms-b.html
const GLOSSARY_MAP = {}; // { letter: [{ letter, key, content }] }

var ep = new eventproxy();

function init(req, res, next) {
  console.log(`GLOSSARY_URL : ${GLOSSARY_URL}`);
  superagent.get(GLOSSARY_URL).end(function(err, pres) {
    var $ = cheerio.load(pres.text);
    console.log('\n------------------- load ---------------------\n');
    $('.content-box .text1')
      .eq(0)
      .find('a')
      .each(function(i, item) {
        var letter = $(item)
          .text()
          .charAt(0);
        LETTER_LIST.push(letter);
        const letter_url = letter !== 'A' ? `-${letter.toLowerCase()}` : '';
        PAGE_LIST.push(`${GLOSSARY_URL_PRE}${letter_url}.html`);
      });
    console.log('getByLetters LETTER_LIST : ', JSON.stringify(LETTER_LIST));
    getByLetters();
  });
}
exports.index = init;

function getByLetters() {
  LETTER_LIST.forEach(function(letter, n) {
    const letter_url = letter !== 'A' ? `-${letter.toLowerCase()}` : '';
    const pageUrl = `${GLOSSARY_URL_PRE}${letter_url}.html`;

    GLOSSARY_MAP[letter] = [];

    (function(letter) {
      setTimeout(function() {
        superagent.get(pageUrl).end(function(err, pres) {
          // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
          // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
          // 剩下就都是利用$ 使用 jquery 的语法了
          var $ = cheerio.load(pres.text);
          var $contentBox = $('.content-box');

          console.log(`\n>>>>>>>>>>>>>>>>> pageUrl : ${pageUrl}`);


          $contentBox.each(function(idx, element) {
            var $item = $(element);
            var $acronym = $('.acronym', $item);

            if ($acronym.length) {
              // 替换a ：`${hrefName}` =>  `[${hrefName}](${href})`
              var $hrefs = $item.find('a');
              $hrefs.each(function(j, ele) {
                var $href = $(ele);
                var href = $href.attr('href');
                var hrefName = $href.text();
                $href.text(`[${hrefName}](${href})`);
              });

              // key => 【key】
              $acronym.each(function(k, el) {
                var $el = $(el);
                var key = $el.text();
                $el.text(`【${key}】`);
              });

              var htmlOfBox = $item.html();
              var textOfBox = $item.text(); //【key】content  【key1】 content1 ...
              var list = textOfBox
                .split('【')
                .filter((item) => item)
                .map((item) => {
                  const arr = item.split('】');
                  return {
                    letter,
                    key: arr[0],
                    content: arr[1],
                  };
                });

              GLOSSARY_MAP[letter] = list;

              // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
              ep.emit('BlogArticleHtml', list);
            }
          });
        });
      }, 1000 * 10 * n);
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
      console.log('all GLOSSARY_MAP :', JSON.stringify(GLOSSARY_MAP));
      // console.log('\n\n\n <<<<<<<<<<<<<<<<<<<<<<<<< finish get');
      append2Json('pharmaceutical-drug-manufacturers', GLOSSARY_MAP);
      Object.entries(GLOSSARY_MAP).forEach((item) => {
        // append2Json(item[0], item[1]);
        json2Csv('pharmaceutical-drug-manufacturers', item[1]);
        // json2Csv(item[0], item[1]);
      });
    }, 10000);
  });
}

function append2Json(name, value) {
  fs.appendFile(`./exports/${name}-glossary.json`, JSON.stringify(value), 'utf8', (err) => {
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
    append2Csv(`./exports/${name}-glossary.csv`, csv);
  } catch (err) {
    // console.error(`^^^^^^^^^^^^^^^^^^^^^^^  json2Csv err: ${err}`);
  }
}

init();
