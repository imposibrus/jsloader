/*
* Plugins - объект со всеми плагинами, их путями и функциями инициализации.
* urls - Array - массив адресов скрипта. Первый адрес - основной, остальные - вспомогательные.
* condition - Function - проверяет нужно ли загружать скрипт. Возвращает true/false.
* init - Function - не обязательна, выполняется после загрузки скрипта.
* css - Array - не обязателен, грузит дополнительно CSS файлы.
*/
var Plugins = {
  audiojs: {
    urls: [
      '//cdn.jsdelivr.net/audiojs/0.1/audio.min.js',
      '/js/audiojs/audio.min.js'
    ],
    condition: function() {
      return $('audio').length > 0;
    },
    init: function() {
      if(!$('script[src="'+ Plugins.audiojs.loaded.url +'"]').length) {
        $('body').append('<script src="'+ Plugins.audiojs.loaded.url +'">');
      }
      audiojs.events.ready(function() {
        audiojs.createAll();
      });
    }
  },
  mousewheel: {
    urls: [
      '//cdn.jsdelivr.net/mousewheel/3.0.6/jquery.mousewheel.min.js',
      '/js/jquery.mousewheel-3.0.6.pack.js'
    ],
    condition: true
  },
  fancybox: {
    urls: [
      '//cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.pack.js',
      '/js/jquery.fancybox.pack.js'
    ],
    css: [
      '//cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.css',
      '/css/jquery.fancybox.css'
    ],
    condition: true,
    init: function(data, textStatus, jqXHR, ths) {
      var link = this.css[Plugins.fancybox.loaded.index];
      $(function() {
        $('head').append('<link href="'+ link +'" rel="stylesheet" type="text/css">');
        $('.fancy').fancybox();
      });
    }
  },
  history: {
    urls: [
      '//cdn.jsdelivr.net/history.js/1.7.1/history.js',
      '/js/history.js'
    ],
    condition: true
  },
  easing: {
    urls: [
      '//cdn.jsdelivr.net/jquery.easing/1.3/jquery.easing.1.3.js',
      '/js/jquery.easing.1.3.js'
    ],
    condition: true
  }
};

function getScript(url) {
  return $.ajax({url: url, cache: true});
}

function loadInit(data, textStatus, jqXHR, e, ths) {
  if(e.init && typeof(e.init) == 'function') e.init(data, textStatus, jqXHR, ths);
}

function recursLoad(cur, e, ths, name) {
  getScript(e.urls[cur]).done(function(data, textStatus, jqXHR) {
    Plugins[name].loaded = {url: e.urls[cur], index: cur};
    loadInit(data, textStatus, jqXHR, e, ths);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    if(textStatus == 'parsererror') {
      // баг getScript - выкидывает parsererror при загрузке с локального домена
      $('<script/>').attr('src', e.urls[cur]).appendTo('body');
      Plugins[name].loaded = {url: e.urls[cur], index: cur};
      loadInit(jqXHR.responseText, textStatus, jqXHR, e, ths);
    } else if(cur + 1 < e.urls.length) {
      // если текущий скрипт загрузить не удалось - пытаемся загрузить его по
      // следующему адресу в массиве
      recursLoad(cur + 1, e, ths, name);
    }
  });

}

$(function() {
  $.each(Plugins, function(i,e) {
    if(e.condition) {
      // если condition == true, то пытаемся загрузить скрипт по одну из путей.
      var cur = 0;
      recursLoad(cur, e, this, i);
    }
  });
});




