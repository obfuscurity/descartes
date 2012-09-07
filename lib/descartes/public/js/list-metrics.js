
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
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
          url: graphiteUrl + '/render?target=' + d[target] + '&from=-' + myInterval + '&format=json'
        }).done(function(output) {
          var data = [];
          for (var i in output[0].datapoints) {
            data[i] = { x: output[0].datapoints[i][1], y: output[0].datapoints[i][0] || 0 };
          }
          var hash = this.hash;
          var graph = new Rickshaw.Graph({
            element: document.getElementById(hash),
            height: 25,
            width: 400,
            renderer: 'area',
            series: [{ data: data }]
          });
          graph.render();
          $('.metrics div#' + hash).append(this.target);
        });
      }
      selectActiveColumnButton();
      selectActiveIntervalButton();
    }
  });
};

// Invert metrics_graph button when opened
$('div.well').on('click', 'a.metrics_graph.btn.closed', function() {
  console.log("open");
  $(this).text('Cancel Graph').removeClass('closed').addClass('open').addClass('btn-inverse');
});

// Revert metrics_graph button when closed
$('div.well').on('click', 'a.metrics_graph.btn.open', function() {
  console.log("closed");
  $(this).text('Add to Graph').removeClass('open').addClass('closed').removeClass('btn-inverse');
});
