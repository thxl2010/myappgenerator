/*
 * http://www.regulet.com/index/video/list.html?cate_id=0&cid=241&page=2
 * http://www.regulet.com/index/video/list?cid=241
 *   html : .videoCon ul li a[href] : /index/video/detail.html?id=16
 *
 * http://www.regulet.com/api/video/getVideoDetail?id=16
 *   {"code":200,"msg":"请求成功","time":"1669873910",
 *     "data":{"id":16,"cate_id":26,"title":"药品研发质量管理体系的建立","image":"\/uploads\/20221108\/1419c8eb72ed06f9639316959099af24.png",
 *       "url":"http:\/\/1306393989.vod2.myqcloud.com\/b81394fcvodsh1306393989\/6e9ce3d8243791576490567134\/X8KENErEmykA.mp4?t=21e19e0c9bab2400000&sign=2041872cb61bcf17bf69bf82a5b54ab7",
 *       "duration":"35:47",
 *       "real_duration":5747,
 *       "is_free":1,"try_see_duration":0,"price":"0.00","learn_num":0,"play_num":72,"createtime":"2022-11-08 16:29:08","cid":241,"isCollect":false,"category":{"id":26,"flag":"","type":"video","name":"基础课程","type_text":"课程视频中心","flag_text":""}}}
 *
 *
 * @Author: Duyb
 * @Date: 2022-12-01 13:44:11
 * @Last Modified by: Duyb
 * @Last Modified time: 2022-12-01 18:27:14
 */
const fs = require('fs');
const superagent = require('superagent');
const cheerio = require('cheerio');
const Async = require('async'); // 并发连接数控制
const axios = require('axios');

const request = axios.create({
  timeout: 1000,
  headers: { Cookie: 'token=899e4025-c678-40d8-9acb-b0d4c30a48c8; uid=416' },
});

/**
 * 获取视频id列表
 * @returns {Promise<number[]>}
 */
const getList = () => {
  const getListBypage = (page) =>
    new Promise((resolve, reject) => {
      console.log('page :', page);
      superagent
        .get(
          `http://www.regulet.com/index/video/list.html?cate_id=0&cid=241&page=${page}`
        )
        .end((err, pres) => {
          // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
          // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
          // 剩下就都是利用$ 使用 jquery 的语法了
          const $ = cheerio.load(pres.text);
          // console.log('res.text :', pres.text);
          const $aList = $('.videoCon>ul').eq(0).find('li>a');
          const ids = Array.from($aList).map((a) => {
            const $a = $(a);
            const href = $a.attr('href');
            const url = new URL(`http://a.com${href}`);
            const id = url.searchParams.get('id');

            return id;
          });

          resolve(ids);
        });
    });

  const PAGE_COUNT = 2;
  return Promise.all(
    Array.from({ length: PAGE_COUNT }).map((_, i) => getListBypage(i + 1))
  );
};

/**
 * @typedef Detail
 * @property {object} data
 * @property {string} data.title
 * @property {string} data.url
 * @property {number} data.real_duration
 */

/**
 * 获取 video 的 real_duration 和 url
 * @param {number} id
 * @returns {Promise<Detail>}
 */
const getVideoDetail = (id, cb) => {
  request
    .get('http://www.regulet.com/api/video/getVideoDetail', {
      params: { id },
    })
    .then(({ data }) => {
      cb(null, data.data);
    })
    .catch((err) => {
      cb(err);
    });
};

// 根据传入的参数发起范围请求
const getBinaryContent = async (url, start, end, i) => {
  let { data } = await axios.get(url, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Host: '1306393989.vod2.myqcloud.com',
      // 'if-range': '905a32a70f10592ae4e3daaae8694a7c-444',
      // range: 'bytes=0-7012351',
      // range: 'bytes=0-7000',
      Range: `bytes=${start}-${end}`,
      Referer: 'http://www.regulet.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
    responseType: 'stream',
  });
  return { index: i, data };
};

const downVideo = (detail) => {
  const { url, title } = detail;

  return new Promise((resolve, reject) => {
    request
      .get(url, {
        headers: {
          range: 'bytes=0-',
          Referer: 'http://www.regulet.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
        responseType: 'stream',
      })
      .then(({ data }) => {
        const writer = fs.createWriteStream(`./out/${title}.mp4`);
        data.pipe(writer);
        writer.on('error', (error) => {
          writer.close();
          console.log(title, 'writer error');
          reject(error);
        });
        writer.on('close', () => {
          console.log(`success :`, title);
          resolve();
        });
      });
  });
};

const downVideos = (list, i) => {
  const len = list.length;
  downVideo(list[i]).then(() => {
    if (i === len - 1) {
      return;
    }

    downVideos(list, i + 1);
  });
};

/**
 * start
 */
getList().then((ids) => {
  const videoIds = ids.flat();
  console.log('videoIds :', videoIds);
  Async.mapLimit(
    videoIds,
    5,
    function (id, cb) {
      getVideoDetail(id, cb);
    },
    function (err, result) {
      if (err) {
        throw err;
      }
      console.log('result :', result);
      downVideos(
        result.filter((_, i) => i < 2),
        0
      );
    }
  );
});
