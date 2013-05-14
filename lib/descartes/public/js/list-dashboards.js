// Default settings
var myColumns = 4;
var mySearchString = '';

// Remove all row and graph divs
var clearDashboards = function() {
  $('div.dashboards div.row').remove();
}

// Grab configuration blob and construct our graph urls
var renderDashboards = function(owner) {
  var myUrl = '';
  if (window.location.pathname.match(/dashboards/)) {
    myUrl = window.location.pathname;
    if (mySearchString.length > 0) {
      myUrl += '?search=' + encodeURI(mySearchString);
    }
  } else {
    myUrl = '/dashboards?favorites=true'
  }
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No dashboards found');
      return;
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
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append('<span class="star">&#9734;</span>');
      var cardDashboardName = '<span class="name" id="' + d[i].uuid + '">' + d[i].name + '</span>';
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append(cardDashboardName);
      var cardGraphCount = '<span class="count">' + d[i].graph_count + '</span>';
      $($($($('div.dashboards div.row')[row]) + 'span.dashboard.span' + spanSize)[i]).append(cardGraphCount);
    }
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/favorites'
    }).done(function(d) {
      if (d.length === 0) {
        console.log('No favorites found');
        return;
      }
      for (var i=0; i < d.length; i++) {
        $('.dashboards .row a span#' + d[i]).addClass('favorite');
      }
    });
  });
};

// Delete a dashboard
var deleteDashboard = function(uuid, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: '/dashboards/' + uuid
  }).done(function(d) {
    console.log('Dashboard ' + uuid + ' successfully deleted');
    cb();
  });
};

// Initial page load
renderDashboards();

// Search form
$('input.search-query').keypress(function(e) {
  if (e.which === 13) {
    mySearchString = $('input.search-query').attr('value');
    clearDashboards();
    renderDashboards();
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
  clearDashboards();
  renderDashboards();
  return false;
});

