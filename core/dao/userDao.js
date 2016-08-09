/**
 * Created by Duyb on 2016/8/8.
 */
// 实现与MySQL交互

var mysql = require('mysql');
var $CONF = require('../config/db-config');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');

// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $CONF.mysql));

// 向前台返回json方法的简单封装
var jsonWrite = function (res, ret) {
  if(typeof ret === 'undefined') {
    res.json({
      code:'1',
      msg: '操作失败'
    });
  } else {
    res.json(ret);
  }
};


module.exports = {
  add: function (req, res, next) {
    pool.getConnection(function(err, connection) {
      // 获取前台页面传过来的参数
      // req.param获取pathinfo中参数 /api/users/{id}
      // req.query获取查询参数 /api/users?name=wwx
      // req.body获取form提交参数
      // http://i5ting.github.io/node-http/#106
      //var param = req.query || req.params;
      var param = req.body;

      console.log('req : ', req.body);
      console.info('add param : ', param);

      // 建立连接，向表中插入值
      // 'INSERT INTO user(id, name, signature) VALUES(0,?,?)',
      connection.query($sql.insert, [param.name, param.signature], function(err, result) {
        if(result) {
          result = {
            code: 200,
            msg:'增加成功'
          };
        }

        // 以json形式，把操作结果返回给前台页面
        jsonWrite(res, result);

        console.info('add result : ', result);

        // 释放连接
        connection.release();
      });
    });
  },
  delete: function (req, res, next) {
    // delete by Id
    pool.getConnection(function(err, connection) {
      var id = +req.query.id;
      connection.query($sql.delete, id, function(err, result) {
        if(result.affectedRows > 0) {
          result = {
            code: 200,
            msg:'删除成功'
          };
        } else {
          result = void 0;
        }
        jsonWrite(res, result);
        connection.release();
      });
    });
  },
  update: function (req, res, next) {
    // update by id
    // 为了简单，要求同时传name和age两个参数
    var param = req.body;
    if(param.name == null || param.age == null || param.id == null) {
      jsonWrite(res, undefined);
      return;
    }

    pool.getConnection(function(err, connection) {
      connection.query($sql.update, [param.name, param.age, +param.id], function(err, result) {
        // 使用页面进行跳转提示
        if(result.affectedRows > 0) {
          res.render('suc', {
            result: result
          }); // 第二个参数可以直接在jade中使用
        } else {
          res.render('fail',  {
            result: result
          });
        }

        connection.release();
      });
    });

  },
  queryById: function (req, res, next) {
    var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
    pool.getConnection(function(err, connection) {
      connection.query($sql.queryById, id, function(err, result) {
        jsonWrite(res, result);
        connection.release();

      });
    });
  },
  queryUserCount: function (req, res, next) {
    pool.getConnection(function (err, connection) {
      connection.query($sql.queryUserCount, function (err, result) {
        jsonWrite(res, result[0].count);
        console.log('^_^ queryUserCount : ', result[0].count);
        connection.release();
      });
    });
  },
  queryAll: function (req, res, next) {
    var page = +req.query.page;
    var pageSize = +req.query.pageSize;
    pool.getConnection(function(err, connection) {
      connection.query($sql.queryAll, [page, pageSize], function(err, result) {
        jsonWrite(res, result);

        console.info('^_^ $sql.queryAll, [page, pageSize] : ', $sql.queryAll, [page, pageSize]);
        console.info('^_^ page : ', page, ' pageSize : ', pageSize, '\nresult : ', result);
        connection.release();
      });
    });
  }
};