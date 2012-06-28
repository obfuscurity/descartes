// remove all row and graph divs
var clearGraphs = function() {
  $('div.graphs div.row').remove();
}
// calculate our bootstrap span size
var spanSize = function(columns) {
  return 12 / columns;
}

var selectActiveColumnButton = function(columns) {
  $('.columns.btn-group button.columns.btn.active').removeClass('active');
  $($('.columns.btn-group button.columns.btn')[columns]).addClass('active');
}

// grab configuration blob and construct our graph urls
var renderGraphs = function(columns, interval) {
  var columns = columns;
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
      row = Math.floor(i/columns);
      var ss = spanSize(columns);
      if (($('div.graphs div.row').length - 1) !== row) {
        $('div.graphs').append('<div class="row"></div>');
      }
      $($('div.graphs div.row')[row]).append('<div class="graph span' + ss + '"></div>');
      var myHeight = 150;
      var myWidth = $($('div.row div.graph')[0]).width();
      var myInterval = (typeof c.from == 'undefined') ? '-1hours' : c.from[0];
      var myGraphUrl = url + '/render/?' + 'height=' + myHeight + '&width=' + myWidth + '&from=' + myInterval + targets + '&hideLegend=true'; // + '&hideGrid=true';
      $($($($('div.graphs div.row')[row]) + 'div.graph.span' + ss)[i]).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
      $($($($('div.graphs div.row')[row]) + 'div.graph.span' + ss)[i]).append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" />');
    }
    selectActiveColumnButton(columns);
  });
};

clearGraphs();
renderGraphs(3);

$('.columns.btn-group button.columns.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    var myColumns = $(this).attr('value');
    clearGraphs();
    renderGraphs(myColumns);
  }
});
