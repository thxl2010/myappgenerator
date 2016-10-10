/**
 * Created by Duyb on 2016/8/8.
 */
var Common = require('./components/common');
var Services = require('./components/services');
var UserListT = require('../../views/templates/user-list.jade');

var $name = $('#name');
var $signature = $('#signature');
var $add = $('#add');

$(function () {
  console.log('start : ');
  getAllUser();
});

$add.on('click', (e) => {
  console.log('click : ', e);
  var user = {
    name: $name.val(),
    signature: $signature.val()
  };
  addUser(user);
});

// 添加用户
function addUser(user) {
  if (!user.name) {
    return Common.flashAjaxInfo('请输入用户名！', 'error');
  }
  if (!user.signature) {
    return Common.flashAjaxInfo('请输入用户签名！', 'error');
  }
  Common.doAjaxWithInfo(() => {
    Services.ajaxPost('/users/addUser', user, (err, result) => {
      if(err) {
        return done(err);
      }
      console.log(result);
      done();
    });
  });
}

var $userList = $('#user-list');
var $table = $userList.find('table>tbody');
var $pager = $userList.find('.pager');
// 获取所有用户列表
function getAllUser() {
  Common.doAjaxWithInfo(function (done) {
    Services.ajaxGet('/users/queryUserCount', function (err, count) {
      if(err) {
        return done(err);
      }
      console.log(count);
      var pageSize = 10;
      if (count) {
        $pager.pagination(count, {
          callback: function (index, jq) {
            Services.ajaxGet('/users/queryAll', {page: index, pageSize: pageSize}, function (err, result) {
              if (err) {
                return done(err);
              }
              $table.empty();
              for (var i = 0;i < result.length;i++) {
                var data = result[i];
                var $userList = $(UserListT({user: data})).data(data);
                $table.append($userList);
              }
            });
          },
          items_per_page:pageSize,
          num_display_entries:5,
          num_edge_entries:1,
          prev_text:'上一页',
          next_text:'下一页'
        });
      }
      done();
    });
  });
}