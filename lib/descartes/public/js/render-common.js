// Default settings
var myColumns = 3;
var mySort = 'default';
var myInterval = '1h';
var myGraphHeight = 150;
var myGraphTemplate = graphTemplate || 'plain';
var myGraphOptions = 'noCache=true&hideLegend=true&template=' + myGraphTemplate;
var myPageIndex = 1;
var myRowIndex = 0;
var myMetricsPerPage = 50;
var myDeleteGraphCounter = 0;
var myImageDestroyMode = false;
var myDescription = '';
var myLineMode = 'slope';
var myAreaMode = 'off';
var myLogMode = 'off';
var myNullMode = 'off';
var myGraphRefreshId = 0;
var myGraphRefreshInterval = 10000;
var myFullScreenEnabled = false;

// Store our current values
var mySearchString = '';
var myTextInputValue = '';
var myMetrics = {};

// Mobile device settings
if (navigator.userAgent.match(/(iPhone|iPod)/i)) {
  myColumns = 1;
  myGraphHeight = 300;
}

// Render our page title
var renderTitle = function() {
  $('.header h1').find('span').remove();
  if (mySearchString.length > 0) {
    $('.header h1').append('<span class="filter"> + search for "' + mySearchString + '"</span>');
  }
}

// Activate the star if favorited
var setFavoriteStatus = function() {
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'GET',
    url: '/favorites'
  }).done(function(d) {
    var uuid = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
    for (var i in d) {
      if (d[i] == uuid) {
        $('.star a').addClass('active');
        $('.star a').removeClass('inactive');
        return;
      }
    }
  });
}

// Remove all row and graph divs
var clearGraphs = function() {
  $(window).off('scroll', scrollNextPage);
  $('div.graphs div.row').remove();
  $('.metrics div').remove();
  myPageIndex = 1;
  myRowIndex = 0;
}

// Select our active column choice
var selectActiveColumnButton = function() {
  $('.columns.btn-group button.columns.btn.active').removeClass('active');
  $($('.columns.btn-group button.columns.btn')[myColumns]).addClass('active');
}

// Select our active interval choice
var selectActiveIntervalButton = function() {
  var index = $($('.interval.btn-group button.interval.btn:contains(' + myInterval + ')')).attr('name');
  $('.interval.btn-group button.interval.btn.active').removeClass('active');
  $($('.interval.btn-group button.interval.btn')[index]).addClass('active');
}

// Select our active sort choice
var selectActiveSortButton = function() {
  var index = $($('.sort.btn-group button.sort.btn:contains(' + mySort + ')')).attr('name');
  $('.sort.btn-group button.sort.btn.active').removeClass('active');
  $($('.sort.btn-group button.sort.btn')[index]).addClass('active');
}

// Toggle "destroy mode" for a graph
var setImageDestroyMode = function() {
  if (myImageDestroyMode === true) {
    $('.destroy_all input[name=destroy_all]').change(function() {
      ($(this).attr('checked') === 'checked')
        ? $('div.row span.graph a img').addClass('destroy')
        : $('div.row span.graph a img').removeClass('destroy');
    });
    $('div.row span.graph a').toggle(function() {
      $(this).children('img').addClass('destroy');
      return false;
    }, function() {
      $(this).children('img').removeClass('destroy');
      return false;
    });
  }
}

// Enable fullscreen on click
$('.tools.btn-group button.tools.btn.fullscreen').click(function() {
  window.location.href = URI(URI(window.location.href)).addSearch({ fullscreen: 'true' }).href();
});

// Update our default settings
var updateLocalSettings = function(settings) {
  if (settings !== null) {
    if (typeof settings.lineMode === 'string') { myLineMode = settings.lineMode; }
    if (typeof settings.areaMode === 'string') { myAreaMode = settings.areaMode; }
    if (typeof settings.logBase === 'string') { myLogMode = settings.logBase; }
    if (typeof settings.drawNullAsZero === 'string') { myNullMode = settings.drawNullAsZero; }
  }
};

// Non-regex function for parsing URLs, courtesy of James Padolsey
// http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
var parseUrl = function(url) {
  var a =  document.createElement('a');
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(':',''),
    host: a.hostname,
    port: (function(){
      if (a.port) {
        return a.port;
      } else if (a.protocol == 'https:') {
        return 443;
      } else {
        return 80;
      }
    })(),
    query: a.search,
    params: (function(){
      var ret = {},
        seg = a.search.replace(/^\?/,'').split('&'),
        len = seg.length, i = 0, s;
      for (;i<len;i++) {
        if (!seg[i]) { continue; }
        s = seg[i].split('=');
        ret[s[0]] = s[1];
      }
      return ret;
    })(),
    file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
    hash: a.hash.replace('#',''),
    path: a.pathname.replace(/^([^\/])/,'/$1'),
    relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
    segments: a.pathname.replace(/^\//,'').split('/')
  };
}

// Construct our graph URL
var constructGraphUrl = function(graph) {
  // we want to default to container dimensions first,
  // then fall back to the object settings saved from import
  var myGraphWidth = $('div.graph div.preview').width() || $('span.graph').width() || graph.width;
  var myGraphHeight = $('span.graph').height() || graph.height;
  
  // construct our custom graph options
  var myLocalGraphOptions = myGraphOptions;
  if (graph.options !== undefined) {
    myLocalGraphOptions += graph.options;
  }
  delete graph.options;
  if (useSVG === 'true') {
    myLocalGraphOptions += '&format=svg';
  }

  // reconstruct our base URL with credentials
  var myParseUrl = parseUrl(graphiteUrl);

  myAuthUrl = myParseUrl.protocol + '://' + graphiteUser + ':' + graphitePass + '@' + myParseUrl.host + ':' + myParseUrl.port;

  // add our remaining params to the URL
  var myGraphUrl = myAuthUrl + '/render/?' + 'height=' + myGraphHeight + '&width=' + myGraphWidth;
  var targets = '';
  for (var j in graph.targets) {
    if (graph.targets[j].axis === 2) {
      targets += '&target=secondYAxis(' + graph.targets[j].name + ')';
    } else {
      targets += '&target=' + graph.targets[j].name;
    }
  }
  myGraphUrl += '&from=-' + myInterval + targets + '&lineMode=' + (graph.lineMode || myLineMode);
  myLocalAreaMode = (graph.areaMode || myAreaMode);
  if (myLocalAreaMode !== 'off') {
    myGraphUrl += '&areaMode=' + myLocalAreaMode;
  }
  myLocalLogMode = (graph.logBase || myLogMode);
  if (myLocalLogMode !== 'off') {
    myGraphUrl += '&logBase=' + myLocalLogMode;
  }
  myLocalNullMode = (graph.drawNullAsZero || myNullMode);
  if (myLocalNullMode === 'on') {
    myGraphUrl += '&drawNullAsZero=true';
  } else {
    myGraphUrl += '&drawNullAsZero=false';
  }
  if (myLocalGraphOptions.length > 0) {
    myGraphUrl += '&' + myLocalGraphOptions;
  }

  // filter out any reserved params that were originally imported as part of the url
  reservedParams = [ 'width', 'height', 'targets', 'target', 'lineMode', 'areaMode',
                     'areaMode', 'logBase', 'drawNullAsZero', 'title', '_salt',
                     'from', 'until', 'noCache', 'hideLegend', 'template' ];

  for (var param in graph) {
    if ($.inArray(param, reservedParams) == -1) {
      myGraphUrl += '&' + param + '=' + graph[param];
    }
  }

  return encodeURI(myGraphUrl);
};

// POST a new graph
var submitGraph = function(opts, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: opts,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: '/graphs'
  }).done(function(d) {
    cb(d);
  })
};

// Delete a graph (either from dashboard or entirely from system)
var deleteGraph = function(uuid, cb) {
  var myUrl = '';
  // dashboard
  if (window.location.pathname.match(/^\/dashboards/) !== null) {
    myUrl = window.location.pathname + '/graphs/' + uuid;
  // graph profile
  } else if (window.location.pathname.match(/^\/graphs\/\w+/) !== null) {
    myUrl = window.location.pathname;
  // graph list
  } else {
    myUrl = window.location.pathname + '/' + uuid;
  }
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: myUrl
  }).done(function(d) {
    console.log('Graph ' + uuid + ' successfully deleted');
    cb();
  });
};

// Update object attributes
var updateObjectAttributes = function(opts, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: opts,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'PUT',
    url: window.location.pathname
  }).done(function(d) {
    console.log("successfully updated attribute");
    cb();
  })
};

// Convert input into editable field
var editTextInput = function() {
  $(this).unbind('click');
  $(this).removeClass('locked');
  $(this).addClass('unlocked');
  myTextInputValue = $(this).text();
  $(this).html('<input type="text" class="name input-xxlarge" value="' + $(this).html() + '" />');
  $(this).children().focus();
  return false;
}

// Reset our fieldset form and buttons
var resetFieldsetFormAndButtons = function(target) {
    $('fieldset.collapse').removeClass('in').css('height', '0px');
    $('fieldset.collapse' + target).addClass('in').css('height', 'auto');
    $('a.import.btn').text('Import Graphs').removeClass('btn-inverse');
    $('a.dashboard.btn').text('Add to Dashboard').removeClass('btn-inverse');
    $('a.details.btn').text('Details').removeClass('btn-inverse');
};

// Enable the auto-refresh mode
var enableAutoRefresh = function() {
  $('.tools.btn-group button.tools.btn.refresh').addClass('btn-success active');
  $('.tools.btn-group button.tools.btn.refresh').children('i').addClass('icon-white');
  myGraphRefreshId = setInterval(function() {
    $('.graph img').each(function() {
      $(this).attr('src', URI($(this).attr('src'))
        .removeSearch('_ts')
        .addSearch('_ts', new Date().getTime()).href()
      );
    });
  }, myGraphRefreshInterval);
  updateUrlParams();
}

// Disable the auto-refresh mode
var disableAutoRefresh = function() {
  $('.tools.btn-group button.tools.btn.refresh').removeClass('btn-success active');
  $('.tools.btn-group button.tools.btn.refresh').children('i').removeClass('icon-white');
  clearInterval(myGraphRefreshId);
  myGraphRefreshId = 0;
  updateUrlParams();
}

// Populate our toolbar based on URL params
var setParamsOnLoad = function() {
  if (window.location.pathname.match(/chartroulette/)) {
    return;
  }
  if ($.url().param('interval') != undefined) {
    myInterval = $.url().param('interval');
  }
  if ($.url().param('columns') != undefined) {
    myColumns = $.url().param('columns');
  }
  if ($.url().param('sort') != undefined) {
    mySort = $.url().param('sort');
  }
  if ($.url().param('fullscreen') != undefined) {
    if ($.url().param('fullscreen') === 'true') {
      myFullScreenEnabled = true;
      $('div.navbar').css('visibility', 'hidden');
    }
  }
  if ($.url().param('refresh') != undefined) {
    if ($.url().param('refresh') === 'true') {
      enableAutoRefresh();
    } else {
      disableAutoRefresh();
    }
  }
  if (! myFullScreenEnabled) {
    $('.interval.btn-group button.dropdown-toggle span.current_value').text($('.interval.btn-group ul.dropdown-menu li a[name=' + myInterval + ']')[0].innerText)
    if ($('.sort.btn-group').length > 0) {
      $('.sort.btn-group button.dropdown-toggle span.current_value').text($('.sort.btn-group ul.dropdown-menu li a[name=' + mySort + ']')[0].innerText)
    }
  }
};

// Update our URL to reflect the current viewing state
var updateUrlParams = function() {
  var myPath = window.location.pathname;
  var myUrl = URI(URI(window.location.href).path()).addSearch({ interval: myInterval });
  if (myPath.match(/^\/graphs\/?$/) || myPath.match(/dashboards/)) {
    myUrl.addSearch({ columns: myColumns });
    myUrl.addSearch({ sort: mySort });
  }
  var refreshEnabled = (myGraphRefreshId === 0) ? 'false' : 'true';
  myUrl.addSearch({ refresh: refreshEnabled });
  if (myFullScreenEnabled === true) {
    myUrl.addSearch({ fullscreen: 'true' });
  }
  window.history.pushState({}, '', myUrl.href());
}

// Initial page load
setParamsOnLoad();
clearGraphs();
renderGraphs();

// Invert "Add to Dashboard" button mode when activated
// Populate "Add to Selected Dashboards" select field
$(window).on('click', 'a.dashboard.btn', function() {
  console.log('clicked')
  if ($('fieldset.in.collapse').length > 0) {
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Dashboard').addClass('btn-inverse');
    $('#dashboard_select ul li select option').remove();
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/dashboards'
    }).done(function(results) {
      for (var i in results) {
        $('#dashboard_select ul li select').append('<option value="' + results[i].uuid + '">' + results[i].name + '</option>');
      }
    });
  } else {
    $(this).text('Add to Dashboard').removeClass('btn-inverse');
  }
});

// Form to create dashboard from current view
// Redirect to new dashboard on success
$('form#dashboard_new ul li').on('click', 'button.dashboard_submit', function() {
  var name = $('input.dashboard_name').val();
  var u = [];
  if ($('span.graph label').length > 0) {
    for (var i=0; i < $('span.graph label').length; i++) {
      u[i] = $($('span.graph label')[i]).attr('for');
    }
  } else {
    u.push($('.graph .preview img').attr('name'));
  }
  var g_uuids = u.join(",");
  $.ajax({
    accepts: {json: 'application/json'},
    data: {name: name, uuids: g_uuids},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: '/dashboards'
  }).done(function(d) {
    console.log('Graphs successfully added to Dashboard ' + d.uuid);
    window.location.href = "/dashboards/" + d.uuid;
  });
  return false;
});

// Add current view to selected dashboard
// Redirect to dashboard on success
$('#dashboard_select ul li').on('click', 'button.dashboard_submit', function() {
  var uuid = $('#dashboard_select ul li select option:selected').val();
  var u = [];
  if ($('span.graph label').length > 0) {
    for (var i=0; i < $('span.graph label').length; i++) {
      u[i] = $($('span.graph label')[i]).attr('for');
    }
  } else {
    u.push($('.graph .preview img').attr('name'));
  }
  var g_uuids = u.join(",");
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {uuids: g_uuids},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: '/dashboards/' + uuid + '/graphs'
  }).done(function() {
    console.log('Graphs successfully added to Dashboard ' + uuid);
    window.location.href = '/dashboards/' + uuid;
  });
  return false;
});

// Update interval on selection
$('.interval.btn-group ul.dropdown-menu li').on('click', 'a', function() {
  myInterval = $(this).attr('name');
  updateUrlParams();
  clearGraphs();
  renderGraphs();
  $('.interval.btn-group button.dropdown-toggle span.current_value').text($(this)[0].innerText);
  $('.interval.btn-group').removeClass('open');
  return false;
});

// Update sort on selection
$('.sort.btn-group ul.dropdown-menu li').on('click', 'a', function() {
  mySort = $(this).attr('name');
  updateUrlParams();
  clearGraphs();
  renderGraphs();
  $('.sort.btn-group button.dropdown-toggle span.current_value').text($(this)[0].innerText);
  $('.sort.btn-group').removeClass('open');
  return false;
});

// Update columns on selection
$('.columns.btn-group button.columns.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myColumns = $(this).attr('value');
    updateUrlParams();
    clearGraphs();
    renderGraphs();
  }
});

// Reset view parameters to default
$('.tools.btn-group button.tools.btn.reset').click(function() {
  window.location.href = window.location.pathname;
});

// Auto-refresh mode for graphs
$('.tools.btn-group button.tools.btn.refresh').click(function() {
  if (myGraphRefreshId === 0) {
    enableAutoRefresh();
  } else {
    disableAutoRefresh();
  }
});

// Search form
$('input.search-query').keypress(function(e) {
  if (e.which === 13) {
    mySearchString = $('input.search-query').attr('value');
    clearGraphs();
    renderGraphs();
    return false;
  }
});

// Render search reset button transition
$('i.reset-search.icon-remove-circle').hover(function() {
  $(this).addClass('hover');
}, function() {
  $(this).removeClass('hover');
});

// Clear search form
$('i.reset-search.icon-remove-circle').click(function() {
  $('input.search-query').val('');
  mySearchString = '';
  clearGraphs();
  renderGraphs();
  return false;
});

// Bind header to click action
$('h1.locked').on('click', editTextInput);

// Submit object name change on enter
$('h1').on('keypress', 'input.name', function(e) {
  if (e.which === 13) {
    var newName = $('h1 input.name').val();
    updateObjectAttributes({'name': newName}, function() {
      window.location.href = window.location.pathname;
    });
  }
});

// Reset header element on focusout
$('h1').on('focusout', 'input.name', function(e) {
  $('h1').removeClass('unlocked');
  $('h1').addClass('locked');
  $(this).remove();
  $('h1').html(myTextInputValue);
  myTextInputValue = '';
  $('h1.locked').on('click', editTextInput);
  return false;
});

// Toggle destroy mode for deleting graphs
$('.tools.btn-group a.tools.btn.trash').on('click', function() {
  if ($('fieldset.in.collapse').length === 0) {
    myImageDestroyMode = true;
    setImageDestroyMode();
    $(this).addClass('btn-inverse active');
    $(this).children('i').addClass('icon-white');
    $('#destroy_warning ul li button.destroy_submit').on('click', function() {
      var markedGraphs = $('div.row span.graph a img.destroy');
      myDeleteGraphCounter = markedGraphs.length;
      for (var g in markedGraphs) {
        deleteGraph(markedGraphs[g].name, function() {
          myDeleteGraphCounter -= 1;
          console.log(myDeleteGraphCounter + ' graphs remaining');
          if (myDeleteGraphCounter === 0) {
            window.location.href = window.location.pathname;
          }
        });
      }
      return false;
    });
  } else {
    myImageDestroyMode = false;
    $(this).removeClass('btn-inverse active');
    $(this).children('i').removeClass('icon-white');
    clearGraphs();
    renderGraphs();
  }
});
