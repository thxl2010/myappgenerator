/*
 * [问题回复——药物临床试验现场检查](https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=1)
 * @Author: Duyb
 * @Date: 2020-11-08 22:04:07
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-11-08 22:57:51
 */

const Axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = {
  nty: 'STA024',
  name: 'default',
  // pageNo: '16',
  total_pages: '17',
  // cur_page: '16',
  iTotal_length: '82',
  module: 'A004',
  flid: '1',
  part: 'main',
  m1: '10',
  tcode: 'STA026',
  m2: '',
  pk: '',
};

for (let i = 1; i <= 1; i++) {
  setTimeout(() => {
    const formData = new FormData();
    Object.entries(form).forEach(item => {
      formData.append(item[0], item[1]);
    });
    formData.append('pageNo', `${i}`);
    formData.append('cur_page', `${i}`);

    Axios.request({
      method: 'POST',
      url:
        'https://www.cfdi.org.cn/cfdi/index?module=A004&m1=10&m2=&nty=STA024&tcode=STA026&flid=1',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    })
      .then(res => {
        console.log('get data', res.data);
        fs.writeFile(`./out/20201108/cfdi/${i}.html`, res.data, err => {
          if (err) return console.error('write err ：', err);
          console.log(`success ${i}`);
        });
      })
      .catch(err => {
        console.error('get err', err);
      });
  }, 1000 * 2);
}
