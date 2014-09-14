var appId = '0H4SMABBSG';
var apiKey = 'ddad357a3c9a243f14883afcf84ecb49';

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

var TLDsApp = (function() {
  var els = {
    hits: document.getElementById('hits'),
    input: document.getElementById('search-field'),
    hitTemplate: document.getElementById('hit-template'),
    noHitTemplate: document.getElementById('no-hit-template'),
  };

  var templates = {
    hit: _.template(els.hitTemplate.innerHTML),
    noHit: _.template(els.noHitTemplate.innerHTML)
  }

  var app = {};
  var hits = [];

  function loadProducts() {
    var client = new AlgoliaSearch(appId, apiKey);
    var index = client.initIndex('Post_production');
    var params = {
      hitsPerPage: 1000,
      attributesToRetrieve: 'name,url',
      attributesToHighlight: 'none'
    };

    index.search('', function(success, result) {
      if(success) {
        hits = _.filter(result.hits, function(hit) {
          return hit.url.indexOf('bit.ly') === -1 &&
                 hit.url.indexOf('itunes.apple.com') === -1 &&
                 hit.url.indexOf('herokuapp.com') === -1 &&
                 hit.url.indexOf('play.google.com') === -1;
        });
      }
    }, params)
  };

  function tldToRegex(tld) {
    var sanitized = tld.replace(/^\./, '').replace('.', '\\.');
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
      var url = new URL(hit.url);
      host = url.hostname.replace('www.', '');
      hit.host = host;
      return templates.hit(hit);
    });

    if(hitsEls.length) {
      els.hits.innerHTML = hitsEls.join('');
    } else {
      els.hits.innerHTML = templates.noHit();
    }
  };

  function handleInput() {
    renderHits(hitsForTld(els.input.value));
  };

  app.init = function() {
    loadProducts();
    els.input.addEventListener('input', handleInput, false);
  };

  return app;
})();

TLDsApp.init();
