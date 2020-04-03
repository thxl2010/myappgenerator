/**
 * Created by Duyb on 2016/9/12.
 */
var superagent = require('superagent');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var async = require('async'); // 并发连接数控制
var eventproxy = require('eventproxy');

var ep = new eventproxy();
var articles = []; // 存放爬取文章信息
var pageUrls = []; // 存放文章地址
var urlsArray = [];	//存放爬取网址
var catchDate = [];	//存放爬取数据
var pageNum = 1; // 要爬取文章页数


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

/*            var title = $element.find('.titlelnk').text();
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
            urlsArray.push(href);*/

            // 相当于一个计数器 ep.emit() 来告诉 ep 自己，某某事件已经完成了。
            ep.emit('BlogArticleHtml', href);
          });
        });
  });

  // 命令 ep 重复监听 pageUrls.length * 20 次 `BlogArticleHtml` 事件再行动
  ep.after('BlogArticleHtml', pageUrls.length * 20, function (articleUrls) {
    // articleUrls 是个数组，包含了 40 次 ep.emit('BlogArticleHtml', href) 中的那 pageUrls.length * 20 个 href
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    // ...
    //console.log('******************* ep.after ********************');
    //console.log('articleUrls : ', articleUrls);


    // 使用async控制异步抓取
    // mapLimit(arr, limit, iterator, [callback])
    // 异步回调
    async.mapLimit(articleUrls, 5, function (url, callback) {
      reptileMove(url, callback);
    }, function (err, result) {
      // pageUrls.length * 20 个 URL 访问完成的回调函数
      // ...
      //console.log('********** async.mapLimit ***********\n result : \n', result);
      //console.log('catchDate : ', catchDate);
      res.render('spider-cnblogs', {
        title: '爬虫-cnblogs',
        signature: '白马山庄',
        articles: articles,
        blogsArr: blogsArr
      });
    });
  });
};

// 控制并发数
var curCount = 0;
var blogsArr = [];
var reptileMove = function (url, callback) {
  //延迟毫秒数
  var delay = parseInt((Math.random() * 30000000) % 1000, 10);
  curCount++;
  var cnblog;
  //console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

  superagent.get(url)
      .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
          console.log(err);
          return;
        }

        // sres.text 里面存储着请求返回的 html 内容
        var $ = cheerio.load(sres.text);
        // 收集数据
        // 拼接URL
        var currentBlogApp = url.split('/p/')[0].split('/')[3],
            requestId = url.split('/p/')[1].split('.')[0],
            appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp=" + currentBlogApp;

        var title = $('#cb_post_title_url').text();
        var userName = $('#profile_block').find('a').eq(0).text();
        cnblog = $('#cnblogs_post_body');
        var time = $('#post-date').text();

        blogsArr.push({
          title: title,
          href: url,
          cnblog: cnblog,
          userName: userName,
          time: time
        });
        //console.log('currentBlogApp is '+ currentBlogApp + '\n' + 'requestId id is ' + requestId);

        // 收集用户个人信息，昵称、园龄、粉丝、关注
        //personInfo(appUrl);
      });

  setTimeout(function () {
    curCount--;
    // callback(null, url + ' Call back content');
    callback(null, cnblog);
  }, delay);
};

// 抓取昵称、入园年龄、粉丝数、关注数
function personInfo(url){
  var infoArray = {};
  superagent.get(url)
      .end(function(err,ares){
        if (err) {
          console.log(err);
          return;
        }

        var $ = cheerio.load(ares.text),
            info = $('#profile_block a'),
            len = info.length,
            age = "",
            flag = false,
            curDate = new Date();

        // 小概率异常抛错
        try{
          age = "20"+(info.eq(1).attr('title').split('20')[1]);
        }
        catch(err){
          console.log(err);
          age = "2012-11-06";
        }

        infoArray.name = info.eq(0).text();
        infoArray.age = parseInt((new Date() - new Date(age))/1000/60/60/24);

        if(len == 4){
          infoArray.fans = info.eq(2).text();
          infoArray.focus = info.eq(3).text();
        }else if(len == 5){// 博客园推荐博客
          infoArray.fans = info.eq(3).text();
          infoArray.focus = info.eq(4).text();
        }
        //console.log('用户信息:'+JSON.stringify(infoArray));
        catchDate.push(infoArray);
      });
}
