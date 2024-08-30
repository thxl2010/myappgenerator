/*
 * code: T01569551
 * url: https://gtis.geely.com/gum/manual/html/E245-E245/topics/T01569551.html
 * @Author: Duyb
 * @Date: 2024-08-30 10:31:19
 * @Last Modified by: Duyb
 * @Last Modified time: 2024-08-30 13:27:55
 */
var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');
const MANUAL_DATA = require('./E5/manual.json');

const BASE = 'https://gtis.geely.com/gum/manual/html/E245-E245/topics/';

// image: graphics/36000077250200aa.png
// https://gtis.geely.com/gum/manual/html/E245-E245/topics/graphics/36000077250200aa.png
// url: BASE + image

const catalog = MANUAL_DATA.catalog;

let num = 0;
const imgs = [];

// function init(catalog) {
//   catalog.forEach((item) => {
//     if (item.code) {
//       superagent.get(BASE + item.code + '.html').end(function (err, res) {
//         if (err) {
//           console.log('🚀 ~ err code :', item.code, ' err :', err);
//           // return;
//         }
//         // console.log('🚀 ~ catalog.forEach ~ res:', res);
//         createHtml(item.code, res.text);
//       });
//     }

//     if (item.children && item.children.length) {
//       init(item.children);
//     }
//   });
// }

function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function getHtml(code) {
  return new Promise((reject, resolve) => {
    superagent.get(BASE + code + '.html').end(function (err, res) {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

async function init2(catalog) {
  for (let i = 0; i < catalog.length; i++) {
    await sleep();
    const item = catalog[i];
    if (item.code) {
      try {
        const res = await getHtml(item.code);
        createHtml(item.code, res.text);
      } catch (err) {
        console.log('🚀 ~ err code :', item.code, ' err :', err);
      }
    }

    if (item.children && item.children.length) {
      init2(item.children);
    }
  }
}

function createHtml(code, text) {
  const html = text.replace(/graphics\/(\w+)/g, (match) => {
    imgs.push(BASE + match);
    return BASE + match;
  });
  // fs.writeFileSync(`${__dirname}/E5/topics/${code}.html`, html);
  num += 1;

  console.log(num, ' 🚀 ~ createHtml success ~ code:', code);
  console.log(num, ' 🚀 ~ createHtml success ~ imgs:', JSON.stringify(imgs));
}

// init2(catalog);
