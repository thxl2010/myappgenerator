/**
 * Created by DYB on 2016/7/27.
 */

/**
 *  ajaxInfo type :
 *  --------------------------------------
 *  class        background-color
 *  --------------------------------------
 *  ''           #5bc0de  (blue)
 *  'error'      #d9534f  (red)
 *  'warning'    #f0ad4e  (orange)
 *  'success'    #5cb85c  (green)
 *
 */
var DEFAULT_TIME = 1000;
var ajaxInfoTimer;
var ajaxInfoDelay = {'':1000, 'success':3000, 'warning':3000, 'error':3000};
var $ajaxInfo = $('#ajax-info');

$('.close-ajax-info', $ajaxInfo).on('click', function () {
  hideAjaxInfo();
});

$('.digits-allowed').on('keypress', function (event) {
  var keyCode = event.keyCode || event.charCode;
  if (keyCode !== 8 && !/\d/.test(String.fromCharCode(keyCode))) {
    event.preventDefault();
  }
});

$('.amount-allowed').on('keypress', function (event) {
  var keyCode = event.keyCode || event.charCode;
  if (keyCode !== 8 && !/\d|\./.test(String.fromCharCode(keyCode))) {
    event.preventDefault();
  }
});

function showAjaxInfo(info, type) {
  $ajaxInfo.attr('class', type || '').fadeIn('fast').find('span').text(info);
}
exports.showAjaxInfo = showAjaxInfo;

function hideAjaxInfo() {
  $ajaxInfo.fadeOut('fast');
}
exports.hideAjaxInfo = hideAjaxInfo;

function showLoading() {
  $ajaxInfo.attr('class', 'info').fadeIn('fast').find('span').text('正在加载...');
}
exports.showLoading = showLoading;

function flashAjaxInfo(info, type, time) {
  $ajaxInfo.attr('class', type || '').fadeIn('fast').find('span').text(info);
  clearTimeout(ajaxInfoTimer);
  ajaxInfoTimer = setTimeout(function () {
    $ajaxInfo.fadeOut('fast');
  }, time || ajaxInfoDelay[type || '']);
}
exports.flashAjaxInfo = flashAjaxInfo;

exports.clearSelection = function () {
  var sel;
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    sel = window.getSelection();
    if (sel && sel.removeAllRanges)
      sel.removeAllRanges();
  }
};

exports.highlight = function ($element) {
  $element.animate({ opacity:0.3 }).animate({ opacity:1 });
};

exports.doAjaxWithInfo = function (command, options) {
  if (options && options.loadingUI) {
    showLoadingUI(options.loadingUI);
  } else if (options && options.waitMessage) {
    if (!$ajaxLoading.is(':visible')) {
      showAjaxInfo(options.waitMessage);
    }
  } else {
    showLoading();
  }
  command(function (err) {
    if (options && options.loadingUI) {
      hideLoadingUI();
    }
    if (err) {
      if(typeof err === 'string' && err === 'timeout'){
        return flashAjaxInfo('请求超时，请重试！', 'error', 10000);
      }
      if(typeof err === 'string' && err==='abort'){
        return;
      }
      return flashAjaxInfo(err.msg, 'error', 10000);
    }
    if (options && options.successMessage) {
      return flashAjaxInfo(options.successMessage);
    }
    hideAjaxInfo();
  });
};

var $ajaxLoading = $('.ajax-loading');

function showLoadingUI(id) {
  var $ele = $(typeof id === 'string' ? ('#' + id) : '#content');
  if (!$ele.length) {
    $ele = $('#content');
  }
  var height = $ele.css('height');
  $ajaxLoading.css('height', height).show()
      .find('.loading-content').css('margin-top', (parseInt(height) - 80) / 2 + 'px');
}

function hideLoadingUI() {
  if (/MSIE 8.0/.test(navigator.userAgent)) {
    $ajaxLoading.hide();
  } else {
    $ajaxLoading.fadeOut();
  }
}

var popupCount = 0;
exports.popup = function ($element, options) {
  options = options || {};
  options.modalClose = false;
  var closeClass = $element.data('closeClass');
  if (!closeClass) {
    closeClass = 'p-close-' + popupCount++;
    $element.data('closeClass', closeClass);
    $('.p-close', $element).addClass(closeClass);
  }
  options.closeClass = closeClass;
  $element.bPopup(options);
};

exports.closePopup = function ($element) {
  $element.bPopup().close();
};

exports.qs = (function (a) {
  if (a == '') return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=');
    if (p.length != 2) continue;
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
})(window.location.search.substr(1).split('&'));