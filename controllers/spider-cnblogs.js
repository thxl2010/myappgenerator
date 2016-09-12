/**
 * Created by Duyb on 2016/9/12.
 */
var superagent = require('superagent');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var async = require('async');
var eventproxy = require('eventproxy');

var ep = new eventproxy();
var articles = []; // 存放爬取文章信息
var pageUrls = []; // 存放文章地址
var pageNum = 2; // 要爬取文章页数


exports.index = function (req, res, next) {

  // for(var i=1 ; i<= pageNum ; i++){
  //   pageUrls.push('http://www.cnblogs.com/#p'+i);
  // }
  //改为 http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=15&ParentCategoryId=0#p11
  for (var i = 1; i <= pageNum; i++) {
    pageUrls.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=' + i + '&ParentCategoryId=0');
  }

  pageUrls.forEach(function (pageUrl) {
    superagent.get(pageUrl)
        .end(function (err, pres) {
          // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
          // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
          // 剩下就都是利用$ 使用 jquery 的语法了
          var $ = cheerio.load(pres.text);

          $('.post_item').each(function (idx, element) {
            var $element = $(element);

            var href = $element.find('.titlelnk').attr('href');
            var title = $element.find('.titlelnk').text();
            var userImg = $element.find('.pfs').attr('src');
            var userName = $element.find('.post_item_foot a').eq(0).text();
            var time = $element.find('.post_item_foot').text().match(/[\d|\-|\:]/g).join('').substring(0, 15);

            articles.push({
              title: title,
              href: href,
              userImg: userImg,
              userName: userName,
              time: time
            });

            //console.log('idx : ', idx, articles);

            // 相当于一个计数器
            ep.emit('BlogArticleHtml', articles);
          });
        });
  });
  ep.after('BlogArticleHtml', pageUrls.length * 20, function (articleUrls) {
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    //console.log('***************************************');
    //console.log('articleUrls : ', articleUrls, articles);

    res.render('spider-cnblogs', {
      title: '爬虫-cnblogs',
      signature: '白马山庄',
      articles: articles
    });
  });
};