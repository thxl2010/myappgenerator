var express = require('express');
var router = express.Router();
var home = require('../controllers/home');
var spiderCnode = require('../controllers/spider-cnode');
var spiderQzone = require('../controllers/spider-qzone');
var spiderCnblogs = require('../controllers/spider-cnblogs');


/* GET page. */
router.get('/', home.index);
router.get('/home', home.index);
router.get('/spiderCnode', spiderCnode.index);
router.get('/spiderZone', spiderQzone.index);
router.get('/spiderCnblogs', spiderCnblogs.index);


/* ajax */
//router.get('/getSignatureById', home.getSignatureById);
router.get('/getTopicsByPage', spiderCnode.getTopicsByPage);

module.exports = router;