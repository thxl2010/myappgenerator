var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('home', { title: 'Du', signature: '白马山庄', version: 2 });
});

router.get('/spiderCnode', function(req, res, next) {

  res.render('spider-cnode', {title: '网络爬虫-CNode', signature: '白马山庄', version: 2 });
});

module.exports = router;
