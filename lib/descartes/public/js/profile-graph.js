
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  var myUrl = window.location.pathname;
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (typeof d === 'undefined') {
      console.log('No graphs found');
    }
    var c = $.parseJSON(d.configuration);
    var targets = "";
    for (var j=0; j < c.target.length; j++) {
      targets += '&target=' + c.target[j];
    }
    $('div.graphs').append('<div class="row"></div>');
    $('div.graphs div.row').append('<div class="graph"></div>');
    $('div.graphs div.row div.graph').append('<div class="preview span12"></div>');
    myGraphOptions = '';
    var myPreviewGraphHeight = myGraphHeight * 2;
    var myGraphWidth = $('div.graph div.preview').width();
    var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myPreviewGraphHeight + '&width=' + myGraphWidth + '&from=-' + myInterval + 'hours' + targets + '&' + myGraphOptions;
    $('div.graph div.preview').append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d.name + '" name="' + d.uuid + '" />');
    selectActiveIntervalButton();
  });
};
