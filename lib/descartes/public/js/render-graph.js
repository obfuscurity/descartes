
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
