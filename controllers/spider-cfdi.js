/*
 * [问题回复——药物临床试验现场检查](https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=1)
 * @Author: Duyb
 * @Date: 2020-11-08 21:52:22
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-11-09 00:08:40
 */
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
// var async = require('async'); // 并发连接数控制
var eventproxy = require('eventproxy');
const { parse } = require('json2csv');
const fields = ['title', 'question', 'answer'];
const opts = { fields };

// page utl qs
const form = {
  // nty: 'STA024',
  // name: 'default',
  pageNo: '16',
  // total_pages: '17',
  cur_page: '16',
  // iTotal_length: '82',
  // module: 'A004',
  // flid: '1',
  // part: 'main',
  // m1: '10',
  // tcode: 'STA026',
  // m2: '',
  // pk: '',
};

const BASE_URL =
  'https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&=k=&nty=STA024&tcode=STA026&flid=1&part=main&iTotal_length=82&name=default&total_pages=17';

const QS_ANS = [];

var ep = new eventproxy();
let count = 0;
const number = 1;

function getList() {
  Array.from({ length: number }).forEach(function (_, i) {
    (function (i) {
      setTimeout(function () {
        const pageUrl = `${BASE_URL}&pageNo=${i + 1}&cur_page=${i + 1}`;
        superagent
          .get(pageUrl)
          .set(
            'accept',
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          )
          .set('accept-encoding', 'gzip, deflate, br')
          .set('accept-language', 'zh-CN,zh;q=0.9')
          .set('accept-charset', 'utf-8,GBK')
          .end(function (err, pres) {
            // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是利用$ 使用 jquery 的语法了
            var $ = cheerio.load(pres.text);
            // console.log('res :', pres);

            $('.page-rep-list').each(function (idx, element) {
              var $container = $(element); // 问题container

              var title = $container.find('.que-info').text();
              var question = $container.find('.que-title').text();
              var answer = $container.find('.que-title').text();
              console.log('title : ', title);
              console.log('question : ', question);
              console.log('answer : ', answer);

              const co = {
                title,
                question,
                answer,
              };
              QS_ANS.push(co);

              // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
              // ep.emit('BlogArticleHtml', co);
            });
          });
      }, 1000 * 2);
    })(i);
  });

  // 命令 ep 重复监听 number 次 `BlogArticleHtml` 事件再行动
  ep.after('BlogArticleHtml', number, function (content) {
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    count += 1;
    console.log(
      '******************* ep.after ******************** count :',
      count
    );
    if (count === number) {
      append2Json(`./out/20201108/cfdi/qs_ans.json`, QS_ANS);
      append2Csv(`./out/20201108/cfdi/qs_ans.csv`, QS_ANS);
      // `./20201108/cfdi/qs_ans.csv`
      json2Csv(`./out/20201108/cfdi/qs_ans_1.csv`, QS_ANS);
    }
  });
}

function append2Json(path, value) {
  fs.appendFile(path, JSON.stringify(value), 'utf8', err => {
    if (err) {
      console.log('json 写入失败', err);
    } else {
      console.log('json 写入成功');
    }
  });
}

function append2Csv(path, value) {
  fs.appendFile(path, value, 'utf8', err => {
    if (err) {
      // console.log('csv 写入失败', err);
    } else {
      // console.log('csv 写入成功');
    }
  });
}

function json2Csv(path, data) {
  try {
    const csv = parse(data, opts);
    // console.log(`^^^^^^^^^^^^^^^^^^^^^^^^^ json2Csv name : ${name} , csv : ${csv}`);
    append2Csv(path, csv);
  } catch (err) {
    // console.error(`^^^^^^^^^^^^^^^^^^^^^^^  json2Csv err: ${err}`);
  }
}

getList();
