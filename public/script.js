_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

var LocationHash = {
  get: function() {
    var decodedHash = null;
    var hash = location.hash.substring(1);

    try {
      decodedHash =  decodeURIComponent(hash);
    } catch (e) {
      decodedHash = hash;
    }

    return decodedHash;
  },

  set: function(value) {
    location.hash = encodeURI(value);
  }
};

var TLDsApp = (function() {
  var els = {
    hits: document.getElementById('hits'),
    input: document.getElementById('search-field'),
    hitTemplate: document.getElementById('hit-template'),
    noHitTemplate: document.getElementById('no-hit-template'),
    loadingTemplate: document.getElementById('loading-template'),
    errorTemplate: document.getElementById('error-template'),
    countTemplate: document.getElementById('count-template')
  };

  var templates = {
    hit: _.template(els.hitTemplate.innerHTML),
    noHit: _.template(els.noHitTemplate.innerHTML),
    loading: _.template(els.loadingTemplate.innerHTML),
    error: _.template(els.errorTemplate.innerHTML),
    count: _.template(els.countTemplate.innerHTML)
  };

  var app = {};
  var currentXhr = null;
  var pageTitle = document.title;

  function loadProducts(tld, offset, onSuccess, onError) {
    var url = '/tld/' + tld + '?offset=' + offset;

    if(currentXhr) {
      currentXhr.abort();
      currentXhr = null;
    }

    var xhr = new XMLHttpRequest();
    currentXhr = xhr;
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400){
        var response = xhr.responseText;
        if (typeof onSuccess === 'function') {
          onSuccess(JSON.parse(response));
        }
      } else {
        if (typeof onError === 'function') { onError(); }
      }
    };

    xhr.onerror = function() {
      if (typeof onError === 'function') { onError(); }
    };

    xhr.send();
  }

  function renderHits(hits, totalCount) {
    var hitsEls = _.map(hits, function(hit) {
      return templates.hit(hit);
    });

    if(hitsEls.length) {
      var count = templates.count({
        count: hits.length,
        totalCount: totalCount
      });
      els.hits.innerHTML = [count].concat(hitsEls).join('');
    } else {
      els.hits.innerHTML = templates.noHit();
    }
  }

  function handleInput() {
    var value = els.input.value.toLowerCase();
    els.input.value = value;
    LocationHash.set(value);

    var title = pageTitle;
    if(value.length) {
      title += ' - ' + value;
    }
    document.title = title;

    if(value.length >= 2) {
      els.hits.innerHTML = templates.loading();
      loadProducts(els.input.value, 0, function(response) {
        if(typeof _gaq !== 'undefined') {
          _gaq.push(['_trackEvent', 'TLDs', 'Search', response.tld]);
        }
        renderHits(response.products, response.total_count);
      }, function() {
        els.hits.innerHTML = templates.error();
      });
    } else {
      els.hits.innerHTML = '';
    }
  }

  function handleHash() {
    var hash = LocationHash.get();
    if(hash.length && hash !== els.input.value) {
      els.input.value = hash;
      handleInput();
    }
  }

  app.init = function() {
    handleHash();

    els.input.addEventListener('input', _.debounce(handleInput, 300), false);
    window.addEventListener('hashchange', handleHash, false);
  };

  return app;
})();

TLDsApp.init();
