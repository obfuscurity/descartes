
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  var myUrl = window.location.pathname;
  if (myTags.length > 0) {
    myUrl += '?tags=' + encodeURI(myTags);
  }
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
    for (var i=0; i < d.graphs.length; i++) {
      var c = $.parseJSON(d.graphs[i].configuration);
      var targets = "";
      for (var j=0; j < c.target.length; j++) {
        targets += '&target=' + c.target[j];
      }
      row = Math.floor( i / myColumns );
      var spanSize = ( 12 / myColumns );
      if (($('div.graphs div.row').length - 1) !== row) {
        $('div.graphs').append('<div class="row"></div>');
      }
      $($('div.graphs div.row')[row]).append('<span id="' + d.graphs[i].uuid + '" class="graph span' + spanSize + '"></div>');
      var myGraphWidth = $($('div.row span.graph')[0]).width();
      var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myGraphHeight + '&width=' + myGraphWidth + '&from=-' + myInterval + 'hours' + targets + '&hideLegend=true'; // + '&hideGrid=true';
      var graphCloseIcon = '<img class="close hidden" src="/img/close.png" />';
      $($($($('div.graphs div.row')[row]) + 'span.graph.span' + spanSize)[i]).append('<label for="' + d.graphs[i].uuid + '">' + d.graphs[i].name + '</label>');
      $($($($('div.graphs div.row')[row]) + 'span.graph.span' + spanSize)[i]).append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d.graphs[i].name + '" name="' + d.graphs[i].uuid + '" />');
      $($($($('div.graphs div.row')[row]) + 'span.graph.span' + spanSize)[i]).append(graphCloseIcon);
    }
    selectActiveColumnButton();
    selectActiveIntervalButton();
  });
};
