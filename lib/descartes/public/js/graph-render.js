// grab configuration blob and construct our graph urls
var renderGraphs = function() {
  return $.ajax({
    accepts: {json: 'application/json'},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: '/graphs'
  }).done(function(d) {
    for (var i=0; i<d.length; i++) {
      var c = $.parseJSON(d[i].configuration);
      for (var j=0; j<c.target.length; j++) {
        var targets = "";
        targets += '&target=' + c.target[j];
      }
      console.log(url + '/render/?' + 'width=370&from=' + c.from[0] + targets);
    }
  });
};

renderGraphs();