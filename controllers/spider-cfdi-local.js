/*
 * [问题回复——药物临床试验现场检查](https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=1)
 * @Author: Duyb
 * @Date: 2020-11-08 21:52:22
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-11-09 14:42:44
 */
const fs = require('fs');
const superagent = require('superagent');
const cheerio = require('cheerio');
const http = require('http');
const url = require('url');
// var async = require('async'); // 并发连接数控制
const eventproxy = require('eventproxy');
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
const DOMAIN = 'https://www.cfdi.org.cn/cfdi/';
const BASE_URL =
  'https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&=k=&nty=STA024&tcode=STA026&flid=1&part=main&iTotal_length=82&name=default&total_pages=17';
const BASE_URL_LOCAL =
  'http://127.0.0.1:5500/controllers/out/20201108/cfdi/HTML/';
const QS_ANS = [];

const ep = new eventproxy();
const count = 0;
const number = 17;

function getList() {
  Array.from({ length: number }).forEach((_, ii) => {
    /* eslint-disable wrap-iife */
    (function a(i) {
      setTimeout(() => {
        // const pageUrl = `${BASE_URL}&pageNo=${i + 1}&cur_page=${i + 1}`;
        const pageUrl = `${BASE_URL_LOCAL}${i + 1}.html`;
        superagent
          .get(pageUrl)
          // .set(
          //   'accept',
          //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          // )
          // .set('accept-encoding', 'gzip, deflate, br')
          // .set('accept-language', 'zh-CN,zh;q=0.9')
          // .set('accept-charset', 'utf-8,GBK')
          .end((err, pres) => {
            // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是利用$ 使用 jquery 的语法了
            const $ = cheerio.load(pres.text);
            // console.log('res :', pres);

            $('.page-rep-list').each((idx, element) => {
              const $container = $(element); // 问题container

              const title = $container.find('.que-info').text();
              const $titleA = $container.find('.que-info a');
              const titleName = $titleA.length
                ? $titleA.text().trim().replace(/\r|\n/g, '')
                : title;
              const titleUrl = $titleA.length ? $titleA.attr('href') : '';
              const titleDate = $container.find('.que-info span').eq(1).text();
              const question = $container
                .find('.que-title')
                .eq(0)
                .text()
                .trim()
                .replace(/\r|\n/g, '');
              const answer = $container
                .find('.que-title')
                .eq(1)
                .text()
                .trim()
                .replace(/\r|\n/g, '');

              const co = {
                title: $titleA.length
                  ? `标题：[${titleName}]    ${titleDate}`
                  : title,
                question,
                answer,
              };
              QS_ANS.push(co);

              // console.log('title : ', co.title);
              // console.log('question : ', co.question);
              // console.log('answer : ', co.answer);
            });
            // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
            ep.emit('emit', i);
          });
      }, 1000 * 2);
    })(ii);
  });

  // 命令 ep 重复监听 number 次 `emit` 事件再行动
  ep.after('emit', number, (i) => {
    // 当所有 'emit' 事件完成后的回调触发下面事件
    // ...
    console.log('emit i: ', i, 'QS_ANS.length :', QS_ANS.length);

    append2Json('./out/20201108/cfdi/qs_ans_20201109.json', QS_ANS);
    // append2Csv('./out/20201108/cfdi/qs_ans.csv', QS_ANS);
    // `./20201108/cfdi/qs_ans.csv`
    json2Csv('./out/20201108/cfdi/qs_ans_20201109.csv', QS_ANS);
  });
}

function append2Json(path, value) {
  fs.appendFile(path, JSON.stringify(value), 'utf8', (err) => {
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
