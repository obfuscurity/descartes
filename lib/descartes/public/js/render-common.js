// Default settings
var myColumns = 3;
var myInterval = '1h';
var myGraphHeight = 150;
var myGraphOptions = 'hideLegend=true';
var myPageIndex = 1;
var myRowIndex = 0;

// Store our current values
var myTags = '';
var myTextInputValue = '';

// Remove all row and graph divs
var clearGraphs = function() {
  $('div.graphs div.row').remove();
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

// Show graph delete button on hover
$(document).on('hover', 'span.graph', function() {
  var mySelector = 'span.graph#' + $(this).attr('id') + ' img.close';
  $(mySelector).toggleClass('hidden');
});

// Call to delete graph
$(document).on('click', 'span.graph img.close', function() {
  deleteGraph($(this).parent().attr('id'), function() {
    clearGraphs();
    renderGraphs();
  });
});

// Show graph view button on hover
$(document).on('hover', 'span.graph', function() {
  var mySelector = 'span.graph#' + $(this).attr('id') + ' img.view';
  $(mySelector).toggleClass('hidden');
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
