// Default settings
var myColumns = 3;
var myInterval = '1h';
var myGraphHeight = 150;
var myGraphTemplate = 'plain';
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

// Store our current values
var myTags = '';
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
  if (myTags.length > 0) {
    $('.header h1').append('<span class="filter"> + search for "' + myTags + '"</span>');
  }
}

// Remove all row and graph divs
var clearGraphs = function() {
  $(window).off('scroll', scrollNextPage);
  $('div.graphs div.row').remove();
  $('.metrics div').remove();
  myPageIndex = 1;
  myRowIndex = 0;
}

// Remove all row and dashboard divs
var clearDashboards = function() {
  $('div.dashboards div.row').remove();
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

// Update our default settings
var updateLocalSettings = function(settings) {
  if (settings !== null) {
    if (typeof settings.lineMode === 'string') { myLineMode = settings.lineMode; }
    if (typeof settings.areaMode === 'string') { myAreaMode = settings.areaMode; }
    if (typeof settings.logBase === 'string') { myLogMode = settings.logBase; }
    if (typeof settings.drawNullAsZero === 'string') { myNullMode = settings.drawNullAsZero; }
  }
};

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

  var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myGraphHeight + '&width=' + myGraphWidth;
  var targets = '';
  for (var j=0; j < graph.targets.length; j++) {
    if (graph.targets[j].axis === 2) {
      targets += '&target=secondYAxis(' + graph.targets[j].name + ')';
    } else {
      targets += '&target=' + graph.targets[j].name;
    }
  }
  myGraphUrl += '&from=-' + myInterval + targets + '&lineMode=' + (graph.lineMode || myLineMode);
  myAreaMode = (graph.areaMode || myAreaMode);
  if (myAreaMode !== 'off') {
    myGraphUrl += '&areaMode=' + (graph.areaMode || myAreaMode);
  }
  myLogMode = (graph.logBase || myLogMode);
  if (myLogMode !== 'off') {
    myGraphUrl += '&logBase=' + myLogMode;
  }
  myNullMode = (graph.drawNullAsZero || myNullMode);
  if (myNullMode === 'on') {
    myGraphUrl += '&drawNullAsZero=true';
  } else {
    myGraphUrl += '&drawNullAsZero=false';
  }
  if (myLocalGraphOptions.length > 0) {
    myGraphUrl += '&' + myLocalGraphOptions;
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
    myUrl = window.location.pathname + '/graphs/' + uuid
  // graph palette
  } else {
    myUrl = window.location.pathname + '/' + uuid
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

// Initial page load
clearGraphs();
renderGraphs();

// Update interval on selection
$('.interval.btn-group button.interval.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myInterval = $(this).attr('value');
    clearGraphs();
    renderGraphs();
  }
});

// Update columns on selection
$('.columns.btn-group button.columns.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myColumns = $(this).attr('value');
    clearGraphs();
    renderGraphs();
  }
});

// Refresh graphs on click
$('.tools.btn-group button.tools.btn.refresh').click(function() {
  clearGraphs();
  renderGraphs();
});

// Tag search form
$('input.search-query').keypress(function(e) {
  if (e.which === 13) {
    myTags = $('input.search-query').attr('value');
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
  myTags = '';
  clearGraphs();
  renderGraphs();
  return false;
});

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
      for (var g=0; g < markedGraphs.length; g++) {
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
