// Default settings
var myColumns = 4;

// Remove all row and graph divs
var clearDashboards = function() {
  $('div.dashboards div.row').remove();
}

// Grab configuration blob and construct our graph urls
var renderDashboards = function(owner) {
  var myUrl = window.location.pathname;
  /* if (tags.length > 0) {
    myUrl += '?tags=' + encodeURI(tags);
  } */
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No dashboards found');
    }
    var row = 0;
    $('div.dashboards').append('<div class="row"></div>');
    for (var i=0; i < d.length; i++) {
      row = Math.floor( i / myColumns );
      var spanSize = ( 12 / myColumns );
      if (($('div.dashboards div.row').length - 1) !== row) {
        $('div.dashboards').append('<div class="row"></div>');
      }
      var cardWrapper = '<a href="/dashboards/' + d[i].uuid + '"><span id="' + d[i].uuid + '" class="dashboard span' + spanSize + '"></span></a>';
      $($('div.dashboards div.row')[row]).append(cardWrapper);
      var cardDashboardName = '<span class="name" id="' + d[i].uuid + '">' + d[i].name + '</span>';
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append(cardDashboardName);
      var cardGraphCount = '<span class="count">' + d[i].graph_count + '</span>';
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append(cardGraphCount);
      var cardCloseIcon = '<img class="close hidden" src="/img/close.png" />';
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append(cardCloseIcon);
    }
  });
};

// Delete a dashboard
var deleteDashboard = function(uuid) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: '/dashboards/' + uuid
  }).done(function(d) {
    console.log('Dashboard ' + uuid + ' successfully deleted');
  });
};

// Initial page load
renderDashboards();

// Show dashboard delete button on hover
$(document).on('hover', 'span.dashboard', function() {
  var mySelector = 'span.dashboard#' + $(this).attr('id') + ' img.close';
  $(mySelector).toggleClass('hidden');
});

// Call to delete dashboard
$(document).on('click', 'span.dashboard img.close', function() {
  deleteDashboard($(this).parent().attr('id'));
  clearDashboards();
  setTimeout(renderDashboards, 200);
  return false;
});
