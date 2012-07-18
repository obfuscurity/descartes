// Default settings
var myColumns = 3;
var myInterval = '1h';
var myGraphHeight = 150;
var myGraphOptions = 'hideLegend=true';
var tags = '';
var myName = '';

// Remove all row and graph divs
var clearGraphs = function() {
  $('div.graphs div.row').remove();
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

// Delete a graph (either from dashboard or entirely from system)
var deleteGraph = function(uuid) {
  var myUrl = '';
  if (window.location.pathname.match(/^\/dashboards/).length > 0) {
    myUrl = window.location.pathname + '/graphs/' + uuid
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
    tags = $('input.search-query').attr('value');
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
  tags = '';
  clearGraphs();
  renderGraphs();
  return false;
});

// Form to create dashboard from current view
// Redirect to new dashboard on success
$('button.dashboard_submit').click(function() {
  var name = $('input.dashboard_name').val();
  var u = [];
  for (var i=0; i < $('span.graph label').length; i++) {
    u[i] = $($('span.graph label')[i]).attr('for')
  }
  var g_uuids = u.join(",");
  var myUrl = '/dashboards';
  $.ajax({
    accepts: {json: 'application/json'},
    data: {name: name, uuids: g_uuids},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: myUrl
  }).done(function(d) {
    window.location.href = "/dashboards/" + d.uuid;
  });
  return false;
});

// Show graph delete button on hover
$(document).on('hover', 'span.graph', function() {
  var mySelector = 'span.graph#' + $(this).attr('id') + ' img.close';
  $(mySelector).toggleClass('hidden');
});

// Call to delete graph
$(document).on('click', 'span.graph img.close', function() {
  deleteGraph($(this).parent().attr('id'));
  clearGraphs();
  setTimeout(renderGraphs, 200);
  return false;
});

// Show graph view button on hover
$(document).on('hover', 'span.graph', function() {
  var mySelector = 'span.graph#' + $(this).attr('id') + ' img.view';
  $(mySelector).toggleClass('hidden');
});

// Update object attributes
var updateObjectAttributes = function(opts) {
  console.log(opts);
  var myUrl = window.location.pathname;
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: opts,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(textStatus); },
    type: 'PUT',
    url: myUrl
  }).done(function(d) {
    window.location.href = myUrl;
  })
};

// Unlock title for editing name, present input field
$('h1.locked').click(function() {
  $(this).unbind('click');
  $(this).removeClass('locked');
  $(this).addClass('unlocked');
  // save original title aside for safekeeping
  myName = $(this).text();
  $(this).html('<input type="text" class="name input-xxlarge" value="' + $(this).html() + '" />');
  $('h1 input.name').focus();
  return false;
});

// Submit object name change
$('h1').on('keypress', 'input.name', function(e) {
  if (e.which === 13) {
    var newName = $('h1 input.name').attr('value');
    updateObjectAttributes({'name': newName});
    //console.log(newGraphName);
    return false;
  }
});

// Reset title on escape
$('h1').on('keyup', 'input.name', function(e) {
  if (e.keyCode === 27) {
    $('h1').removeClass('unlocked');
    $('h1').addClass('locked');
    $(this).remove();
    $('h1').text(myName);
  }
});

// Reset title on focusout
$('h1').on('focusout', 'input.name', function(e) {
  $('h1').removeClass('unlocked');
  $('h1').addClass('locked');
  $(this).remove();
  $('h1').text(myName);
});