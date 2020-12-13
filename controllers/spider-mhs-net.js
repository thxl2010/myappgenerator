/*
 * ! TODO: 201 C
 * ! TODO: 601-1 A
 * @Author: Duyb
 * @Date: 2020-12-12 13:44:35
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-12-12 23:52:43
 */
const fs = require('fs');
const superagent = require('superagent');
const cheerio = require('cheerio');
const axios = require('axios');

axios.defaults.timeout = 60000 * 5;

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
          const title = $h3.text().replace(/\.|:|\//g, ' - ');
          // 1. Section 100 General Administration
          const sectionPath = `./out/20201212/mhs/${title}`;
          console.log('### 1. section path :', sectionPath);
          fs.mkdirSync(sectionPath);
          const sectionUrl = $h3.find('a').attr('href');
          // section book
          if (sectionUrl !== '#') write(sectionUrl, sectionPath);

          $h3
            .next()
            .find('p[style="margin-left: 40px;"]')
            .each((i, item) => {
              const $item = $(item);

              // ! SOP
              const $SOP = $item.prev();
              const sopName = $SOP.text().replace(/:|\.|\//g, ' - ');
              // 2. Section 100 General Administration/SOP 101 Standard Operating Procedures Preparation and Maintenance
              const sopPath = `${sectionPath}/${sopName}`;
              console.log('>>> 2. SOP path :', sopPath);
              fs.mkdirSync(sopPath);

              // sop book
              const $sopA = $SOP.find('a');
              const sopUrl = $sopA.attr('href');
              write(sopUrl, sopPath);

              // ! A/B
              $item.find('a').each((j, ele) => {
                const $ele = $(ele);
                const letter = String.fromCodePoint(j + 65); // $ele.prev().prev().text();
                const name = $ele.text();
                const letterPath = `${sopPath}/${letter} ${name}`;
                console.log('>>>>>>>>>>> 2. letter path :', letterPath);
                fs.mkdirSync(letterPath);

                const lstterUrl = $ele.attr('href');
                write(lstterUrl, letterPath);
              });
            });
        });
    });
}

function write(pathName, outPath) {
  axios
    .get(`${BASE_URL}${pathName}`, {
      responseType: 'stream',
    })
    .then((res) => {
      const disposition = res.headers['content-disposition'];
      const bookName = disposition
        .substring(disposition.indexOf('"') + 1, disposition.length - 1)
        .replace(/\//g, ' ');
      console.log('bookName :', bookName);
      const writer = fs.createWriteStream(`${outPath}/${bookName}`);
      res.data.pipe(writer);
      writer.on('error', (error) => {
        writer.close();
        throw error;
      });
      writer.on('close', () => {
        console.log(`success : ${bookName}`);
      });
    })
    .catch((err) => {
      console.error('axios err :', err);
    });
}

getList();
