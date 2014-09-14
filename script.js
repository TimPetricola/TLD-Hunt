var appId = '0H4SMABBSG';
var apiKey = 'ddad357a3c9a243f14883afcf84ecb49';

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

var TLDsApp = (function() {
  var els = {
    hits: document.getElementById('hits'),
    hitTemplate: document.getElementById('hit-template'),
    input: document.getElementById('search-field')
  };
  var app = {};
  var hits = [];
  var hitTemplate = _.template(els.hitTemplate.innerHTML);

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

  function handleInput() {
    var hitsEls = _.map(hitsForTld(els.input.value), function(hit) {
      var url = new URL(hit.url);
      host = url.hostname.replace('www.', '');
      hit.host = host;
      return hitTemplate(hit);
    });

    els.hits.innerHTML = hitsEls.join('');
  };

  app.init = function() {
    loadProducts();
    els.input.addEventListener('input', handleInput, false);
  };

  return app;
})();

TLDsApp.init();
