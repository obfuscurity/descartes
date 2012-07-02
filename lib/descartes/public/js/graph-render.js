// Default settings
var myColumns = 3;
var myInterval = '1h';
var myGraphHeight = 150;


// Remove all row and graph divs
var clearGraphs = function() {
  $('div.graphs div.row').remove();
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

// Grab configuration blob and construct our graph urls
var renderGraphs = function(tags) {
  var tags = (typeof tags == 'undefined') ? "" : tags;
  var myUrl = '/graphs';
  if (tags.length > 0) {
    myUrl += '?tags=' + encodeURI(tags);
  }
  return $.ajax({
    accepts: {json: 'application/json'},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No graphs found');
    }
    var row = 0;
    $('div.graphs').append('<div class="row"></div>');
    for (var i=0; i < d.length; i++) {
      var c = $.parseJSON(d[i].configuration);
      var targets = "";
      for (var j=0; j < c.target.length; j++) {
        targets += '&target=' + c.target[j];
      }
      row = Math.floor( i / myColumns );
      var spanSize = ( 12 / myColumns );
      if (($('div.graphs div.row').length - 1) !== row) {
        $('div.graphs').append('<div class="row"></div>');
      }
      $($('div.graphs div.row')[row]).append('<div class="graph span' + spanSize + '"></div>');
      var myGraphWidth = $($('div.row div.graph')[0]).width();
      var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myGraphHeight + '&width=' + myGraphWidth + '&from=-' + myInterval + 'hours' + targets + '&hideLegend=true'; // + '&hideGrid=true';
      $($($($('div.graphs div.row')[row]) + 'div.graph.span' + spanSize)[i]).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
      $($($($('div.graphs div.row')[row]) + 'div.graph.span' + spanSize)[i]).append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" />');
    }
    selectActiveColumnButton();
    selectActiveIntervalButton();
  });
};

// Initial page load
clearGraphs();
renderGraphs();

// Invert "Import Graphs" button mode when activated
$('a.import.btn').click(function() {
  if ($('fieldset.in.collapse').length === 0) {
    $(this).text('Cancel Import').addClass('btn-inverse');
  } else {
    $(this).text('Import Graphs').removeClass('btn-inverse');
  }
});

// Invert "New Dashboard" button mode when activated
$('a.dashboard.btn').click(function() {
  if ($('fieldset.in.collapse').length === 0) {
    $(this).text('Cancel Dashboard').addClass('btn-inverse');
  } else {
    $(this).text('New Dashboard').removeClass('btn-inverse');
  }
});

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

// Toggle fullscreen on click
$('.tools.btn-group button.tools.btn.fullscreen').click(function() {
  if ((window.screenTop === 0) && (window.screenY === 0)) {
    $(document).fullScreen(false);
  } else {
    $(document).fullScreen(true);
  }
});

// Tag search form
$('input.search-query').keypress(function(e) {
  if (e.which === 13) {
    var tags = $('input.search-query').attr('value');
    $('input.search-query').val('');
    clearGraphs();
    renderGraphs(tags);
    return false;
  }
});

// Form to create dashboard from current view
// Redirect to new dashboard on success
$('button.dashboard_submit').click(function() {
  var name = $('input.dashboard_name').val();
  var g = [];
  for (var i=0; i < $('div.graph label').length; i++) {     // <-- array of graph labels
    g[i] = $($('div.graph label')[0]).attr('for')  // <-- graph uuid
  }
  var graphs = g.join(",");
  var myUrl = '/dashboards';
  $.ajax({
    accepts: {json: 'application/json'},
    data: {name: name, graphs: graphs},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: myUrl
  }).done(function(d) {
    window.location.href = "/dashboards/" + d.uuid
  });
  return false;
});
