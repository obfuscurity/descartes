
// Apply 'selected' class to metrics in our array
// need this for when we refresh
var selectActiveMetrics = function() {
  var selectedMetrics = Object.keys(myMetrics);
  for (var id in selectedMetrics) {
    $('.metrics div#' + selectedMetrics[id]).removeClass('default').addClass('selected');
  }
};

// Populate our preview graph with selected metrics
var renderPreviewGraph = function() {
  if (Object.keys(myMetrics).length > 0) {
    var selectedMetrics = Object.keys(myMetrics);
    var selectedMetricNames = [];
    for (var id in selectedMetrics) {
      selectedMetricNames.push(myMetrics[selectedMetrics[id]].name);
    }
    myGraph = {
      target: selectedMetricNames,
      options: '&hideLegend=false'
    };
    $('span#metrics_graph_preview').html('<img src="' + constructGraphUrl(myGraph) + '" />');
  } else {
    $('span#metrics_graph_preview').html('<span id="empty">Click any metrics below</span>');
  }
};

// Add the options toolbar to each metric
var addMetricsToolbar = function(metric) {
  $('.metrics .rickshaw_graph#' + metric).append('<div class="options"></div>');
  $('.metrics .rickshaw_graph#' + metric + ' .options').html('<a class="axis left selected" href="#">1</a><a class="axis right" href="#">2</a>');
};

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
        $('div.metrics').append('<div class="default" id="' + hash + '"></div>');
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
          $('div.metrics div#' + hash).append('<span class="target"></span>');
          $('.metrics div#' + hash + ' span.target').text(this.target);
          addMetricsToolbar(hash);
        });
      }
      selectActiveColumnButton();
      selectActiveIntervalButton();
      selectActiveMetrics();
      renderPreviewGraph();
    }
  });
};

// Invert metrics_graph button when opened
$('div.well').on('click', 'a.metrics_graph.btn.closed', function() {
  $(this).text('Cancel Graph').removeClass('closed').addClass('open').addClass('btn-inverse');
});

// Revert metrics_graph button when closed
$('div.well').on('click', 'a.metrics_graph.btn.open', function() {
  $(this).text('Add to Graph').removeClass('open').addClass('closed').removeClass('btn-inverse');
});

// Add metrics to array of items to graph
$('.metrics').on('click', 'div.rickshaw_graph.default', function() {
  console.log("foo");
  var metric = {
    name: $(this).children('span.target').text(),
    id: $(this).attr('id')
  };
  myMetrics[metric.id] = metric;
  $(this).removeClass('default').addClass('selected');
  renderPreviewGraph();
});

// Not working yet...
$('.metrics .rickshaw_graph .options').on('click', 'a.axis', function(e) {
  e.stopImmediatePropagation();
  return false;
});

// Remove metrics from array of items to graph
$('.metrics').on('click', 'div.rickshaw_graph.selected', function() {
  delete myMetrics[$(this).attr('id')];
  $(this).removeClass('selected').addClass('default');
  renderPreviewGraph();
});

// Set axis option
$('.metrics .rickshaw_graph.selected .options').on('.click', 'a.axis', function() {
  console.log($(this).val());
});
