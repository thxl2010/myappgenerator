var AJAX_TIMEOUT = 3600000;

function ajax(type, url, data, callback) {
  $.ajax({
    type:type,
    url:url,
    data:data,
    timeout:AJAX_TIMEOUT,
    success:function (data) {
      if (data.status) {
        if (data.status === 'OK') {
          callback(null, data.data, data.message);
          return;
        }
        callback(data);
        return;
      }
      callback(null, data);
    },
    error:function (jqXHR, textStatus, errorThrown) {
      callback(errorThrown);
    }
  });
}
function ajaxGet(url, data, callback) {
  if (arguments.length == 2) {
    callback = data;
    data = undefined;
  }
  ajax('GET', url, data, callback);
}
exports.ajaxGet = ajaxGet;

function ajaxPost(url, data, callback) {
  //return callback({status:'ERR_TRY',message:'演示版本无法操作！'});
  if (arguments.length == 2) {
    callback = data;
    data = undefined;
  }
  ajax('POST', url, data, callback);
}
exports.ajaxPost = ajaxPost;

exports.disableButton = function ($button, millis) {
  millis = millis || 1000;
  $button.prop( "disabled", true );
  setTimeout(function () {
    $button.prop( "disabled", false );
  }, millis);
};