// Default settings
var myColumns = 4;
var mySearchString = '';
var myCatImages = {};

// Remove all row and graph divs
var clearDashboards = function() {
  $('div.dashboards div.row').remove();
}

// Grab configuration blob and construct our graph urls
var renderDashboards = function(owner) {
  var myUrl = '';
  if (window.location.pathname.match(/dashboards/)) {
    // Normal dashboard view with optional search
    myUrl = window.location.pathname;
    if (mySearchString.length > 0) {
      myUrl += '?search=' + encodeURI(mySearchString);
    }
  } else {
    // Home page view of favorited dashboards
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
    for (var i in d) {
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
    // Cat Mode
    if (useCatMode !== '') {
      $.ajax({
        accepts: {json: 'application/json'},
        cache: false,
        dataType: 'json',
        error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
        url: '/cats/' + d.length
      }).done(function(cats) {
        var cards = $('.row a span.dashboard')
        for (var i=0; i < cards.length; i++) {
          myCatImages[$(cards[i]).attr('id')] = {};
          myCatImages[$(cards[i]).attr('id')]['url'] = cats[i];
          $(cards[i]).css('background-image', 'url(' + myCatImages[ $(cards[i]).attr('id') ]['url'] + ')');
          $(cards[i]).hover(function() {
            $(this).css('background-image', 'none');
          }, function() {
            $(this).css('background-image', 'url(' + myCatImages[ $(this).attr('id') ]['url'] + ')');
          });
        }
      });
    }
    // Apply star to our favorite dashboards
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
      for (var i in d) {
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

