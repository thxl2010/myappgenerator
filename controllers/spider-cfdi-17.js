/*
 * [问题回复——药物临床试验现场检查](https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=1)
 * @Author: Duyb
 * @Date: 2020-11-08 21:52:22
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-11-09 16:58:07
 */
const fs = require('fs');
const superagent = require('superagent');
// [中文乱码](https://cloud.tencent.com/developer/article/1445392)
require('superagent-charset')(superagent); // install charset
const cheerio = require('cheerio');
const http = require('http');
const url = require('url');
// var async = require('async'); // 并发连接数控制
const eventproxy = require('eventproxy');
const { parse } = require('json2csv');

const ep = new eventproxy();

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
// const BASE_URL_227 =
//   'https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=4';
const QS_ANS = [];

const number = 17; // 页数
const count = 82; // 记录笔数
let k = 0;

// csv key
const fields = ['title', 'date', 'question', 'answer'];
const opts = { fields };

function getList() {
  for (let i = 0; i <= number; i++) {
    setTimeout(() => {
      const pageUrl = `${BASE_URL}&pageNo=${i + 1}`;
      superagent
        .get(pageUrl)
        .charset('gbk')
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
              .replace(/\r|\n/, '');
            const answer = $container
              .find('.que-title')
              .eq(1)
              .text()
              .trim()
              .replace(/\r|\n/, '');

            const co = {
              title: $titleA.length
                ? `[${titleName}](${DOMAIN}${titleUrl})`
                : `${title}`,
              date: titleDate,
              question,
              answer,
            };

            k += 1;
            console.log('>>> pageNo : ', i + 1, ' idx :', idx, ' k :', k);
            // console.log('question : ', co.question, ' date :', titleDate);
            // console.log('answer : ', co.answer);
            // console.log('answer : ', co.answer);

            QS_ANS.push(co);

            // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
            ep.emit('BlogArticleHtml', { i, idx });
          });
        });
    }, 1000 * i);
  }

  // 命令 ep 重复监听 number 次 `BlogArticleHtml` 事件再行动
  ep.after('BlogArticleHtml', count, ({ i, idx }) => {
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    console.log(
      '>>> ep.after i',
      i,
      'idx :',
      idx,
      ' QS_ANS.length :',
      QS_ANS.length
    );
    append2Json('./out/cfdi/20201108/药物临床试验现场检查.json', QS_ANS);
    json2Csv('./out/cfdi/20201108/药物临床试验现场检查.csv', QS_ANS);
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
