const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://www.mhs.net';
const sopUrl =
  '/-/media/mhs/files/for-medical-professionals/research/101-sop-preparation-and-maintenance.ashx?la=en&hash=B58215174B2B6EF412D3C705E119248D';

axios.defaults.timeout = 60000 * 5;
axios
  .get(`${BASE_URL}${sopUrl}`)
  .then((res) => {
    console.log('typeof res :', typeof res);
    console.log(
      'k :',
      Object.entries(res).filters(([k]) => k !== 'data')
    );
    // fs.writeFile(`./test/1.json`, JSON.stringify(res), (err) => {
    //   if (err) return console.error('write err :', err);
    //   console.log('success');
    // });
  })
  .catch((err) => {
    console.error('axios err :', err);
  });
