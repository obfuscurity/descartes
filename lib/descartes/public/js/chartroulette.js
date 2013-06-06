
var myDashboards = [];
var myDashboardIndex = 0;
var myDashboardRefreshInterval = 10000;

// Render our page title
var renderChatrouletteTitle = function(dashboard) {
  $('.header h1').find('span').remove();
  $('.header h1').append('<span class="filter"> - <a href="/dashboards/' + dashboard.uuid + '">' + dashboard.name + '</a></span>');
}

var renderGraphs = function() {
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: '/chartroulette'
  }).done(function(d) {
    if (d.length > 0) {
      myDashboards = d;
      renderNextDashboard();
      setInterval(function() {
        clearGraphs();
        renderNextDashboard();
      }, myDashboardRefreshInterval);
    } else {
      $('div.graphs').append('<h3>Oops!</h3>');
      $('div.graphs').append("<p>Sorry, we don't have anything to show you yet. Why don't you favorite (star) a couple dashboards and come back again?");
      console.log('no favorited dashboards to display');
    }
  });
}

var renderNextDashboard = function() {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: '/dashboards/' + myDashboards[myDashboardIndex].uuid
  }).done(function(d) {
    if (d.graphs.length === 0) {
      console.log('No graphs found');
    }
    var row = 0;
    $('div.graphs').append('<div class="row"></div>');
    for (var i in d.graphs) {
      var targets = [];
      for (var j in $.parseJSON(d.graphs[i].configuration).target) {
        targets.push({name: $.parseJSON(d.graphs[i].configuration).target[j]});
      }
      var c = $.extend($.parseJSON(d.graphs[i].configuration), $.parseJSON(d.graphs[i].overrides), {targets: targets});
      row = Math.floor( i / myColumns );
      var spanSize = ( 12 / myColumns );
      if (($('div.graphs div.row').length - 1) !== row) {
        $('div.graphs').append('<div class="row"></div>');
      }
      $($('div.graphs div.row')[row]).append('<span id="' + d.graphs[i].uuid + '" class="graph span' + spanSize + '"></div>');
      var myGraphWidth = $($('div.row span.graph')[0]).width();
      var graphCloseIcon = '<img class="close hidden" src="/img/close.png" />';
      $('div.graphs div.row span#' + d.graphs[i].uuid).append('<label for="' + d.graphs[i].uuid + '">' + d.graphs[i].name + '</label>');
      $('div.graphs div.row span#' + d.graphs[i].uuid).append('<a href="/graphs/' + d.graphs[i].uuid + '"><img src="' + constructGraphUrl(c) + '" alt="' + d.graphs[i].name + '" name="' + d.graphs[i].uuid + '" /></a>');
      $('div.graphs div.row span.graph img').load(function() {
        // hide spinner on successful load
        $(this).parent('a').parent('span').css('background-image', 'none')
      }).error(function() {
        console.log('failed to load ' + $(this)[0].name);
        var broken_img = $(this);
        // hide spinner and set background color
        broken_img.css('display', 'none');
        broken_img.parent('a').parent('span').css('background-image', 'none').css('background-color', '#eee')
        broken_img.parent('a').parent('span').find('label').css('margin', '10px 0 0 15px');
        // change label and link to image profile
        broken_img.parent('a').parent('span').find('label').html('Unable to load <a href="/graphs/' + broken_img[0].name + '">' + broken_img[0].alt + '</a>');
      });
    }
    renderChatrouletteTitle(d.dashboard);
    myDashboardIndex++;
    if (myDashboardIndex == myDashboards.length) {
      myDashboardIndex = 0;
    }
  });
}

// Not used in dashboards
var scrollNextPage = function() {
  return true;
}
