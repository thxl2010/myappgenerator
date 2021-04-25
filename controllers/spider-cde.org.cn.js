/*
 * http://www.cde.org.cn/zdyz.do?method=initValue&frameStr=0#top
 * @Author: Duyb
 * @Date: 2021-04-25 16:53:32
 * @Last Modified by: Duyb
 * @Last Modified time: 2021-04-25 18:39:33
 */

var fs = require('fs');
var superagent = require('superagent');
var cheerio = require('cheerio');

const HOST = 'http://www.cde.org.cn/';
const BASE_URL = `${HOST}zdyz.do?method=initValue&frameStr=0#top`;
const LIST = []; // [{ type, id, link, list[] }]
const BASE_PATH = './out/cde/20210425/LIST.json';

const list = [
  {
    type: ' 指导原则征求意见',
    link: 'zdyz.do?method=list&fclass=FCLASS_ZQYJ&',
  },
  { type: ' 化学药物', link: 'zdyz.do?method=list&fclass=FCLASS_HXYW&' },
  {
    type: ' 中药、天然药物',
    link: 'zdyz.do?method=list&fclass=FCLASS_ZY_TRYW&',
  },
  { type: ' 生物制品', link: 'zdyz.do?method=list&fclass=FCLASS_SWZP&' },
  { type: ' 综合学科', link: 'zdyz.do?method=list&fclass=FCLASS_ZHXK&' },
  { type: ' 审评一般原则', link: 'zdyz.do?method=list&fclass=FCLASS_SPYZ&' },
  {
    type: ' 技术标准/技术要求',
    link: 'zdyz.do?method=list&fclass=FCLASS_ZSBZ&',
  },
  { type: ' 非临床研究', link: 'zdyz.do?method=list&fclass=FCLASS_FLCYJ&' },
];

function init() {
  // console.log('BASE_URL :', BASE_URL);
  superagent.get(BASE_URL).end(function (err, pres) {
    var $ = cheerio.load(pres.text);
    $('#zdyzMenu')
      .find('div')
      .each(function () {
        const $this = $(this);
        const type = $this.text();
        const link = $this.attr('link');
        const id = $this.attr('id').split('_')[1];

        LIST.push({ type, id, link });
      });

    console.log('LIST :', JSON.stringify(LIST));

    LIST.forEach((item) => {
      getByType(item);
    });
  });

  list.forEach((item) => {
    getByType(item);
  });
}

/**
 * 分页： http://www.cde.org.cn/zdyz.do?method=list
 * nowstate:
  fclass: FCLASS_HXYW
  hand:
  orderName: is_sue_date
  keyName: title
  logicC: bh
  keyValue:
  currentPageNumber: 2
  pageMaxNumber: 20
  totalPageCount: 7
  pageroffset: 20
  pagenum: 2
 */

function getByType(item) {
  const url = `${HOST}${item.link}orderName=is_sue_date&pageMaxNumber=1000`;
  console.log('url :', url);
  superagent.get(url).end(function (err, pres) {
    var $ = cheerio.load(pres.text);

    console.log('pres.text :', pres.text);
    // console.log(' --- $(body) :', $('body'));
    console.log('tr length :', $('table tr').length);

    item.list = Array.from($('table [width="700"] tr')).map(($tr) => {
      const $tds = $tr.find('tr');
      return {
        title: $tds[1].text(),
        date: $tds[2].text(),
        type: $tds[3].text(),
      };
    });

    // todo
    if (LIST.filter((ele) => ele.list).length !== LIST.length) return;
    writeFile2JSON(BASE_PATH, JSON.stringify(LIST));
  });
}

function writeFile2JSON(path, data) {
  try {
    fs.writeFileSync(path, data);
  } catch (error) {
    throw error;
  }
}

init();
