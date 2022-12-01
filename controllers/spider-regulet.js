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
 * @Last Modified time: 2022-12-01 18:26:48
 */
const fs = require('fs');
const axios = require('axios');

function getVideo(range) {
  return axios.get(
    // http://1306393989.vod2.myqcloud.com/b81394fcvodsh1306393989/b012b01a243791576491089523/GKahJswiA38A.mp4?t=235b0bd944709e000000&rlimit=100&sign=e2d02154687199b6647ba61daddad680
    // 固体制剂处方工艺开发 http://1306393989.vod2.myqcloud.com/b81394fcvodsh1306393989/e7d4027b243791576488460435/xKrnBEZVAN0A.mp4?t=314dc6448d933800000000000000&sign=3cc1c43a00d85de47bca8f41196d9396
    'http://1306393989.vod2.myqcloud.com/b81394fcvodsh1306393989/7781ad10243791576490901215/Yd4RBHehKcAA.mp4?',
    {
      params: {
        t: '235b0bd944709e000000',
        rlimit: 100,
        sign: 'c2135ca923e48dff2b5575148ce34519',
      },
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Host: '1306393989.vod2.myqcloud.com',
        // 'if-range': '905a32a70f10592ae4e3daaae8694a7c-444',
        // range: 'bytes=0-7012351',
        range: 'bytes=0-7000',
        Referer: 'http://www.regulet.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
      responseType: 'stream',
    }
  );
}

getVideo()
  .then((res) => {
    console.log(Object.keys(res));
    console.log('\n>>>> status :', res.status);
    console.log('\n>>>> headers :', res.headers);
    // console.log('\n>>>> data :', res.data);
    const writer = fs.createWriteStream('./out/video1.mp4');
    res.data.pipe(writer);
    writer.on('error', (error) => {
      writer.close();
      console.log('writer error');
      throw error;
    });
    writer.on('close', () => {
      console.log(`success`);
    });
  })
  .catch((err) => {
    throw err;
  });
