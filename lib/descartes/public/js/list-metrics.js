// Default settings

// Remove all row and graph divs
var clearMetrics = function() {
  $('div.graphs span').remove();
}

// Grab configuration blob and construct our graph urls
var renderMetrics = function() {
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: graphiteUrl + '/metrics/index.json'
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No metrics found');
    } else {
      for (var target in d) {
        hash = CryptoJS.SHA256(d[target]).toString(CryptoJS.enc.Hex);
        $('div.metrics').append('<div id="' + hash + '"></div>');
        $.ajax({
          accepts: {jason: 'application/json'},
          cache: false,
          hash: hash,
          target: d[target],
          dataType: 'jsonp',
          jsonp: 'jsonp',
          error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
          url: graphiteUrl + '/render?target=' + d[target] + '&from=-1hours&format=json'
        }).done(function(output) {
          var data = [{ x:0, y:0 }];
          for (var i in output[0].datapoints) {
            data[i] = { x: output[0].datapoints[i][1], y: output[0].datapoints[i][0] || 0 };
          }
          var hash = this.hash;
          var graph = new Rickshaw.Graph({
            element: document.getElementById(hash),
            height: 25,
            width: 400,
            series: [{ data: data }]
          });
          graph.render();
          $('div.metrics div#' + hash).append(this.target);
        });
      }
    }
  });
};

// Initial page load
renderMetrics();
