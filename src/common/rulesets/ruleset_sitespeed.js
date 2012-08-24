/*
Rules borrowed from Stoyan Stefanov
*/
var YSLOW3PO = {};
YSLOW3PO.is3p = function (url) {
  
  var patterns = [
    'ajax.googleapis.com',
    'apis.google.com',
    '.google-analytics.com',
    'connect.facebook.net',
    'platform.twitter.com',
    'code.jquery.com',
    'platform.linkedin.com',
    '.disqus.com',
    '.lognornal.com'
  ];
  var hostname = YSLOW.util.getHostname(url);
  var re;
  for (var i = 0; i < patterns.length; i++) {
    re = new RegExp(patterns[i]);
    if (re.test(hostname)) {
      return true;
    }
  }
  return false;
}


YSLOW.registerRule({
  id: '_3po_asyncjs',
  name: 'Load 3rd party JS asyncrhonously',
  info: "Use the JavaScript snippets that load the JS files asyncrhonously " +
        "in order to speed up the user experience.",
  category: ['Common'],
  config: {},
  url: 'http://www.phpied.com/3PO#async',

  lint: function (doc, cset, config) {
    var scripts = doc.getElementsByTagName('script');
    var comps = cset.getComponentsByType('js');
    var comp;
    var offenders = {};
    var score = 100;
    
    // find offenders
    for (i = 0, len = scripts.length; i < len; i++) {
      comp = scripts[i];
      if (comp.src && YSLOW3PO.is3p(comp.src)) {
        if (!comp.async && !comp.defer) {
          offenders[comp.src] = 1;
        }
      }
    }

    // match offenders to YSLOW components
    var offender_comps = [];
    for (var i = 0; i < comps.length; i++) {
      if (offenders[comps[i].url]) {
        offender_comps.push(comps[i]);
      }
    }

    // final sweep
    var message = offender_comps.length === 0 ? '' :
      'The following ' + YSLOW.util.plural('%num% script%s%', offender_comps.length) +
        ' not loaded asynchronously:';
    score -= offender_comps.length * 21;

    return {
      score: score,
      message: message,
      components: offender_comps
    };
  }
});



YSLOW.registerRule({
  id: '_3po_jsonce',
  name: 'Load the 3rd party JS only once',
  info: 'Loading the 3rd party JS files more than once per page is not ' +
        'necessary and slows down the user experience',
  category: ['Common'],
  config: {},
  url: 'http://www.phpied.com/3PO#once',
  

  lint: function (doc, cset, config) {
    var i, url, score, len,
        hash = {},
        offenders = [],
        comps = cset.getComponentsByType('js'),
        scripts = doc.getElementsByTagName('script');

    for (i = 0, len = scripts.length; i < len; i += 1) {
      url = scripts[i].src;
      if (!url || !YSLOW3PO.is3p(url) || scripts[i].async || scripts[i].defer) {
        continue;
      }
      if (typeof hash[url] === 'undefined') {
        hash[url] = 1;
      } else {
        hash[url] += 1;
      }
    }

    // match offenders to YSLOW components
    var offenders = [];
    for (var i = 0; i < comps.length; i++) {
      if (hash[comps[i].url] && hash[comps[i].url] > 1) {
        offenders.push(comps[i]);
      }
    }

    score = 100 - offenders.length * 11;

    return {
      score: score,
      message: (offenders.length > 0) ? YSLOW.util.plural(
          'There %are% %num% 3rd party JS file%s% included more than once on the page',
          offenders.length
      ) : '',
      components: offenders
    };
  }
});



YSLOW.registerRuleset({ 
    id: 'sitespeed',
    name: 'Sitespeed.io rules v0.8',
    rules: {
        ynumreq: {
        	// We are a little harder than standard yslow
        	// the number of scripts allowed before we start penalizing
        	max_js: 2,
        	// number of external stylesheets allowed before we start penalizing
        	max_css: 2,
        	// number of background images allowed before we start penalizing
        	max_cssimages: 3
        },
        yemptysrc: {},
        yexpires: {},
        //  3
        ycompress: {},
        //  4
        ycsstop: {},
        //  5
        yjsbottom: {},
        //  6
        yexpressions: {},
        //  7
        yexternal: {},
        //  8
        ydns: {},
        //  9
        yminify: {},
        // 10
        yredirects: {},
        // 11
        ydupes: {},
        // 12
        yetags: {},
        // 13
        yxhr: {},
        // 14
        yxhrmethod: {},
        // 16
        ymindom: {},
        // 19
        yno404: {},
        // 22
        ymincookie: {},
        // 23
        ycookiefree: {},
        // 24
        ynofilter: {},
        // 28
        yimgnoscale: {},
        // 31
        yfavicon: {},
        _3po_asyncjs: {},
    	_3po_jsonce: {}
    },
    weights: {
        ynumreq: 8,
        yemptysrc: 30,
        yexpires: 10,
        ycompress: 8,
        ycsstop: 4,
        yjsbottom: 4,
        yexpressions: 3,
        yexternal: 4,
        ydns: 3,
        yminify: 4,
        yredirects: 4,
        ydupes: 4,
        yetags: 2,
        yxhr: 4,
        yxhrmethod: 3,
        ymindom: 3,
        yno404: 4,
        ymincookie: 3,
        ycookiefree: 3,
        ynofilter: 4,
        yimgnoscale: 3,
        yfavicon: 2,
        _3po_asyncjs: 10,
 	   	_3po_jsonce: 10
    }

});