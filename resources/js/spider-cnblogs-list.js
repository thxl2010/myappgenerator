/**
 * Created by Duyb on 2016/9/14.
 */
var Common = require('./components/common');
var Services = require('./components/services');
var CnblogsListT = require('../../views/templates/cnblogs-list.jade');

var $prev = $('#prev');
var $next = $('#next');
var $page = $('#page');

$prev.on('click', function () {
  var page = +$page.text();
  $page.text(page == 1 ? 1 : page - 1);
  getTopics();
});

$next.on('click', function () {
  var page = +$page.text();
  $page.text(page + 1);
  getTopics()
});

function getTopics() {
  var page = $page.text();
  Services.ajaxGet('/getCnblogsListByPage', {page: page}, function (err, result) {
    if (err) {
      return Common.flashAjaxInfo(err.message, 'error');
    }
    result = JSON.parse(result);
    $('tbody').empty();
    for (var i = 0,len = result.length;i < len;i++) {
      var item = result[i];
      item.i = i + 1;
      var $item = $(CnblogsListT({item: item}));
      $('tbody').append($item);
    }
  });
}

