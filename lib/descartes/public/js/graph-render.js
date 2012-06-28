// grab configuration blob and construct our graph urls
var renderGraphs = function() {
  return $.ajax({
    accepts: {json: 'application/json'},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: '/graphs'
  }).done(function(d) {
    var row = 0;
    $('div.graphs').append('<div class="row"></div>');
    for (var i=0; i < d.length; i++) {
      var c = $.parseJSON(d[i].configuration);
      for (var j=0; j < c.target.length; j++) {
        var targets = "";
        targets += '&target=' + c.target[j];
      }
      row = Math.floor(i/3);
      if (($('div.graphs div.row').length - 1) !== row) {
        $('div.graphs').append('<div class="row"></div>');
      }
      $($('div.graphs div.row')[row]).append('<div class="graph span4"></div>');
      var myHeight = 150;
      var myWidth = $($('div.row div.graph')[0]).width();
      var graphUrl = url + '/render/?' + 'height=' + myHeight + '&width=' + myWidth + '&from=' + c.from[0] + targets + '&hideLegend=true'; // + '&hideGrid=true';
      $($($($('div.graphs div.row')[row]) + 'div.graph.span4')[i]).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
      $($($($('div.graphs div.row')[row]) + 'div.graph.span4')[i]).append('<img src="' + encodeURI(graphUrl) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" />');
    }
  });
};

renderGraphs();