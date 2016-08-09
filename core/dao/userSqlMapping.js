/**
 * Created by Duyb on 2016/8/8.
 */
// CRUD SQL语句
var user = {
  insert:'INSERT INTO user(id, username, signature) VALUES(0010101,?,?)',
  update:'update user set username=?, signature=? where id=?',
  delete: 'delete from user where id=?',
  queryById: 'select * from user where id=?',
  queryAll: 'select username,signature,purchaseVersion,userMobileNumber from user limit ?,?',
  queryUserCount: 'select count(*) as count from user'
};

module.exports = user;