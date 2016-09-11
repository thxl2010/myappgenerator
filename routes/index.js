var express = require('express');
var router = express.Router();
var home = require('../controllers/home');
var spiderCnode = require('../controllers/spider-cnode');

/* GET home page. */
router.get('/', home.index);
router.get('/spiderCnode', spiderCnode.index);
router.get('/getTopicsByPage', spiderCnode.getTopicsByPage);

module.exports = router;
