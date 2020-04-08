/*
 * @Author: Duyb
 * @Date: 2020-04-03 13:28:39
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-04-08 21:21:38
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
const GLOSSARY_URL = 'https://www.canada.ca/en/services/immigration-citizenship/helpcentre/glossary.html';
let LETTER_LIST = [];
const GLOSSARY_MAP = {}; // { letter: [{ letter, key, content }] }

var ep = new eventproxy();

function init(req, res, next) {
  superagent.get(GLOSSARY_URL).end(function(err, pres) {
    var $ = cheerio.load(pres.text);
    $('.pagination a').each(function(i, item) {
      var letter = $(item)
        .text()
        .charAt(0);
      LETTER_LIST.push(letter);
      GLOSSARY_MAP[letter] = [];
    });

    console.log(`LETTER_LIST : ${JSON.stringify(LETTER_LIST)}`);

    $('#wb-auto-6 .row').each(function(i, item) {
      var $item = $(item);
      var $key = $('.col-md-3', $item);

      var key = $key.text();
      var letter = key.charAt(0).toUpperCase();
      var $content = $('.col-md-9', $item);
      var content = $content.text();

      var $hrefs = $content.find('a');
      $hrefs.each(function(j, ele) {
        var $href = $(ele);
        var href = $href.attr('href').trim();
        var hrefName = $href.text().trim();
        content = content.replace(`${hrefName}`, `[${hrefName}](${href})`);
      });

      const co = {
        letter,
        key,
        content,
      };
      GLOSSARY_MAP[letter].push(co);
    });

    // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
    ep.emit('BlogArticleHtml', GLOSSARY_MAP);

    triggerFinish();
  });
}
exports.index = init;

function triggerFinish() {

  // 命令 ep 重复监听 LETTER_LIST.length 次 `BlogArticleHtml` 事件再行动
  ep.after('BlogArticleHtml', 1, function(content) {
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    console.log('******************* ep.after ********************');

    setTimeout(() => {
      append2Json('canada-ca', GLOSSARY_MAP);
      Object.entries(GLOSSARY_MAP).forEach((item) => {
        // append2Json(item[0], item[1]);
        json2Csv('canada-ca', item[1]);
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
      console.log('csv 写入失败', err);
    } else {
      console.log('csv 写入成功');
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
