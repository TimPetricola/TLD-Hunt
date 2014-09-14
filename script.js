var appId = '0H4SMABBSG';
var apiKey = 'ddad357a3c9a243f14883afcf84ecb49';

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
    errorTemplate: document.getElementById('error-template')
  };

  var templates = {
    hit: _.template(els.hitTemplate.innerHTML),
    noHit: _.template(els.noHitTemplate.innerHTML),
    loading: _.template(els.loadingTemplate.innerHTML),
    error: _.template(els.errorTemplate.innerHTML)
  }

  var app = {};
  var loaded = false;
  var hits = [];

  function loadProducts(onSuccess, onError) {
    var client = new AlgoliaSearch(appId, apiKey);
    var index = client.initIndex('Post_production');
    var params = {
      hitsPerPage: 1000,
      attributesToRetrieve: 'name,url',
      attributesToHighlight: 'none'
    };

    index.search('', function(success, result) {
      if(success && !result.message) {
        hits = _.filter(result.hits, function(hit) {
          return hit.url.indexOf('bit.ly') === -1 &&
                 hit.url.indexOf('itunes.apple.com') === -1 &&
                 hit.url.indexOf('herokuapp.com') === -1 &&
                 hit.url.indexOf('play.google.com') === -1;
        });
        loaded = true;
        onSuccess && onSuccess();
      } else {
        onError && onError();
      }
    }, params)
  };

  function urlToHost(url) {
    var a =  document.createElement('a');
    a.href = url;
    return a.hostname.replace('www.', '');
  };

  function tldToRegex(tld) {
    var sanitized = tld.toLowerCase().replace(/^\./, '').replace('.', '\\.');
    return new RegExp('\\.' + sanitized + '(\\/.*)?$');
  };

  function hitsForTld(tld) {
    var regex = tldToRegex(tld);
    return _.filter(hits, function(hit) {
      return regex.test(hit.url);
    });
  };

  function renderHits(hits) {
    var hitsEls = _.map(hits, function(hit) {
      hit.host = urlToHost(hit.url);
      return templates.hit(hit);
    });

    if(hitsEls.length) {
      els.hits.innerHTML = hitsEls.join('');
    } else {
      els.hits.innerHTML = templates.noHit();
    }
  };

  function handleInput() {
    var value = els.input.value.toLowerCase();
    els.input.value = value;
    LocationHash.set(value);

    if(value.length >= 2) {
      if(loaded) {
        renderHits(hitsForTld(els.input.value));
      } else {
        els.hits.innerHTML = templates.loading();
      }
    } else {
      els.hits.innerHTML = '';
    }
  };

  app.init = function() {
    var hash = LocationHash.get();
    if(hash.length) {
      els.input.value = hash;
      if(hash.length >= 2) {
        els.hits.innerHTML = templates.loading();
      }
    }

    loadProducts(handleInput, function() {
      els.hits.innerHTML = templates.error();
    });
    els.input.addEventListener('input', handleInput, false);
  };

  return app;
})();

TLDsApp.init();
