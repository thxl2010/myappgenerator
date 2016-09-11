/**
 * Created by Duyb on 2016/9/11.
 */
var superagent = require('superagent');
var cheerio = require('cheerio');

exports.index = function(req, res, next) {

  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('https://cnodejs.org/') // https://cnodejs.org/?tab=all&page=2
      .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
          return next(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        var $ = cheerio.load(sres.text);
        console.log('***********************************');
        //console.log(sres);
        var items = [];
        $('#topic_list .topic_title').each(function (idx, element) {
          var $element = $(element);
          var $user = $element.closest('.cell').find('.user_avatar img');
          
          items.push({
            title: $element.attr('title'),
            href: $element.attr('href'),
            userImg: $user.attr('src'),
            userName: $user.attr('title')
          });
        });

        //res.send(JSON.stringify(items));
        res.render('spider-cnode', {
          title: '网络爬虫-CNode',
          signature: '白马山庄',
          topics: items
        });
      });
};

function getTopicsByPage(req, res) {
  var page = req.query.page;
  superagent.get('https://cnodejs.org/?tab=all&page=' + page)
      .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
          return next(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        var $ = cheerio.load(sres.text);
        var items = [];
        $('#topic_list .topic_title').each(function (idx, element) {
          var $element = $(element);
          var $user = $element.closest('.cell').find('.user_avatar img');

          items.push({
            title: $element.attr('title'),
            href: $element.attr('href'),
            userImg: $user.attr('src'),
            userName: $user.attr('title')
          });
        });
        
        res.send(JSON.stringify(items));
      });
}

exports.getTopicsByPage = getTopicsByPage;