/*
 * @Author: Duyb
 * @Date: 2020-06-20 23:25:20
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-06-21 15:45:05
 */
var fs = require('fs');
const readline = require('readline');
var axios = require('axios');
var jsonp = require('jsonp');
var Utils = require('../core/util/util');
const imgs = require('./out/book118/imgs.json');

/**
 *
 * @param url: query string
 *  eg: https://somo.so/urlshortener?longUrl=XXX`
 */
const fetchJsonp = url =>
  new Promise((resolve, reject) => {
    jsonp(url, (err, response) => {
      if (err) {
        reject(err);
      } else {
        /* eslint no-lonely-if:0 */
        if (response.status === 'OK') {
          resolve(response);
        } else {
          reject(response);
        }
      }
    });
  });

/**
 * ![GET request for remote image in node.js](https://github.com/axios/axios#axiosconfig)
 * response.data.pipe
 * fs.createWriteStream
 */
function fetchBook() {
  Object.entries(imgs)
    .sort((a, b) => a[0] - b[0])
    .forEach((item, i) => {
      const page = item[0];
      const url = item[1];
      setTimeout(() => {
        axios({
          url: `http:${url}`,
          responseType: 'stream',
        }).then(
          response => {
            // console.log('data :', response);
            response.data.pipe(
              fs.createWriteStream(`./out/book118/imgs/${page}.png`)
            );
          },
          err => {
            console.log('err :', err);
          }
        );
      }, 1000 * i);
    });
}

function renderImgs() {
  let renderImg = '';
  Object.entries(imgs)
    .sort((a, b) => a[0] - b[0])
    .forEach((item, i) => {
      const page = item[0];
      const url = item[1];

      renderImg += `<img src="${url}" alt="${page}" class="img">`;
    });

  document.body.appendChild(renderImg);
}


function rename() {
  Object.entries(imgs)
    .sort((a, b) => a[0] - b[0])
    .forEach((item, i) => {
      const page = item[0];
      const url = item[1];
      const urlArr = url.split('/');
      const len = urlArr.length;
      const name = urlArr[len - 1];

      fs.rename(
        `./out/book118/imgs/React_App/${name}`,
        `./out/book118/imgs/React_App/${i}.png`,
        function (err) {
          if (err) console.log('ERROR: ' + err);
        }
      );
    });
}

function renderMd() {
  Object.entries(imgs)
    .sort((a, b) => a[0] - b[0])
    .forEach((item, i) => {
      const page = item[0];
      const url = item[1];
      const urlArr = url.split('/');
      const len = urlArr.length;
      const name = urlArr[len - 1];

      const no = `${i}`.padStart(3, 0);
      const content = `![${i}](./imgs/pic_${no}.png)\n`;
      fs.appendFileSync('./out/book118/book.md', content, err => {
        if (err) throw err;
        console.log('数据已被追加到文件');
      });
    });
}

// fetchBook();
// renderMd();
