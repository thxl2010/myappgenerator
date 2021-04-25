/*
 * http://www.cde.org.cn/zdyz.do?method=initValue&frameStr=0#top
 * 页面已加密
 * [puppeteer](http://puppeteerjs.com/)
 * npm config set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
 * npm i puppeteer
 *
 * 轻量级的 Puppeteer 版本: 默认不会下载 Chromium
 * npm i puppeteer-core
 * =========================================
 * @Author: Duyb
 * @Date: 2021-04-25 18:24:21
 * @Last Modified by: Duyb
 * @Last Modified time: 2021-04-25 18:44:30
 */

const HOST = 'http://www.cde.org.cn/';
const BASE_URL = `${HOST}zdyz.do?method=initValue&frameStr=0#top`;
const LIST = []; // [{ type, id, link, list[] }]
const BASE_PATH = './out/cde/20210425/LIST.json';

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\Chrome.exe',
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL);

  console.log('page.$ :', page.$);
  const $form = await page.$('#zdyzMenu');
  console.log('$form :', $form);

  // $form.find('div').each(function () {
  //   const $this = $(this);
  //   const type = $this.text();
  //   const link = $this.attr('link');
  //   const id = $this.attr('id').split('_')[1];

  //   LIST.push({ type, id, link });

  //   console.log('LIST :', JSON.stringify(LIST));

  //   // LIST.forEach((item) => {
  //   //   getByType(item);
  //   // });
  // });

  // await browser.close();
})();
