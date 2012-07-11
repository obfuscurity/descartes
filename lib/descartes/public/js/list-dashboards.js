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
      var cardWrapper = '<a href="/dashboards/' + d[i].uuid + '"><div class="dashboard span' + spanSize + '"></div></a>';
      $($('div.dashboards div.row')[row]).append(cardWrapper);
      var cardDashboardName = '<div class="name" id="' + d[i].uuid + '">' + d[i].name + '</div>';
      $($($($('div.dashboards div.row')[row]) + 'div.dashboard.span' + spanSize)[i]).append(cardDashboardName);
      var cardGraphCount = '<div class="count">' + d[i].graph_count + '</div>';
      $($($($('div.dashboards div.row')[row]) + 'div.dashboard.span' + spanSize)[i]).append(cardGraphCount);
    }
  });
};

// Initial page load
renderDashboards();

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
  tags = '';
  clearDashboards();
  renderDashboards();
  return false;
});
