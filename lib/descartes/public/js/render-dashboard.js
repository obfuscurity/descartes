
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  var myUrl = window.location.pathname;
  if (mySearchString.length > 0) {
    myUrl += '?search=' + encodeURI(mySearchString);
  }
  else if ($.url().param('sort') != '') {
    myUrl += '?sort=' + encodeURI($.url().param('sort'));
  }
  else if (mySearchString.length > 0 && $.url().param('sort') != '') {
    myUrl += '?search=' + encodeURI(mySearchString) + '&sort=' + encodeURI($.url().param('sort'));
  }
  setFavoriteStatus();
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.graphs.length === 0) {
      console.log('No graphs found');
    }
    var row = 0;
    $('div.graphs').append('<div class="row"></div>');
    for (var i in d.graphs) {
      var targets = [];
      var mergedConfig = $.extend({}, $.parseJSON(d.graphs[i].configuration), $.parseJSON(d.graphs[i].overrides));
      for (var j in mergedConfig.target) {
        targets.push({name: mergedConfig.target[j]});
      }
      var c = $.extend(mergedConfig, {targets: targets});
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
    selectActiveColumnButton();
    selectActiveSortButton();
    selectActiveIntervalButton();
    setImageDestroyMode();
    renderTitle();
  });
};

// add favorite status to this dashboard
$('span.star').on('click', 'a.inactive', function() {
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: window.location.pathname + '/favorite'
  }).done(function(d) {
    $('.star a').addClass('active');
    $('.star a').removeClass('inactive');
    console.log('adding dashboard as a favorite')
  });
});

// remove favorite status to this dashboard
$('span.star').on('click', 'a.active', function() {
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: window.location.pathname + '/favorite'
  }).done(function(d) {
    $('.star a').addClass('inactive');
    $('.star a').removeClass('active');
    console.log('removing dashboard as a favorite')
  });
});

// Not used in dashboards
var scrollNextPage = function() {
  return true;
}
