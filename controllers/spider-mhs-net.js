/*
 * @Author: Duyb
 * @Date: 2020-12-12 13:44:35
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-12-12 14:12:24
 */
const fs = require('fs');
const superagent = require('superagent');
const cheerio = require('cheerio');
const axios = require('axios');

const BASE_URL = 'https://www.mhs.net';

function getList() {
  superagent
    .get(`${BASE_URL}/medical-professionals/research/sop`)
    .end((err, pres) => {
      // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是利用$ 使用 jquery 的语法了
      const $ = cheerio.load(pres.text);
      // console.log('res :', pres);

      $('.accordion')
        .eq(0)
        .find('h3')
        .each((idx, element) => {
          const $h3 = $(element);
          const title = $h3.text;
          // Section 100 General Administration
          fs.mkdirSync(`./out/20201212/mhs/${title}`);

          $h3
            .next()
            .find('p[style="margin-left: 40px;"]')
            .each((i, item) => {
              const $item = $(item);
              const $SOP = $item.prev();
              const sopName = $SOP.text().replace(':', '');
              // Section 100 General Administration/SOP 101 Standard Operating Procedures Preparation and Maintenance
              fs.mkdirSync(`./out/20201212/mhs/${title}/${sopName}`);

              const $sopA = $SOP.find('a');
              const sopUrl = $sopA.attr('a');
              const sopFileName = $sopA.text();
              const sopFilePath = `./out/20201212/mhs/${title}/${sopName}/${sopFileName}`;
              fs.mkdirSync(sopFilePath);

              axios
                .get(`${BASE_URL}${sopUrl}`)
                .then((data) => {
                  fs.writeFile(`${sopFilePath}`);
                })
                .catch((err) => {
                  console.error('axios err :', err);
                });
            });
        });
    });
}
