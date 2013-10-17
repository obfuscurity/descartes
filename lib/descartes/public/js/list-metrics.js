
var myLoadedMetrics = [];
var myMatchedMetrics = [];
var mySearchTimeoutId = null;

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
    var targets = [];
    for (var id in selectedMetrics) {
      targets.push(myMetrics[selectedMetrics[id]]);
    }
    myGraph = {
      targets: targets,
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
  $('.metrics .rickshaw_graph#' + metric + ' .options').
    html('<a class="axis left selected" title="Left axis" href="#">1</a><a class="axis right" title="Right axis" href="#">2</a>');
};

// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  // Load index.json at first load and cache as myLoadedMetrics
  // Use cached myLoadedMetrics for infinite scrolling
  if (myLoadedMetrics.length > 0) {
    // Use cached myLoadedMetrics
    renderSparklines();
  } else {
    // Load index.json and cache in myLoadedMetrics
    return $.ajax({
      accepts: {'json': 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/metrics/'
    }).done(function(d) {
      if (d.length === 0) {
        console.log('No metrics found');
      } else {
        myLoadedMetrics = d;
        renderSparklines();
      }
    });
  }
};

var renderSparklines = function() {
  // Show our loading div
  $('div.loading').removeClass('hidden');

  if (myMatchedMetrics.length === 0) {
    myMatchedMetrics = myLoadedMetrics;
  }

  for (var target = ((myPageIndex - 1) * myMetricsPerPage); target < (myPageIndex * myMetricsPerPage); target += 1) {
    // Only run if we have an actual target, ignore end of page undefs
    if (myMatchedMetrics[target] !== undefined) {
      // unique identifier so we can track each metric to its DOM element
      hash = CryptoJS.SHA256(myMatchedMetrics[target]).toString(CryptoJS.enc.Hex);
      $('div.metrics').append('<div class="default" id="' + hash + '"></div>');
      $.ajax({
        accepts: {'json': 'application/json'},
        beforeSend: function(xhr) {
          var creds = graphiteUser + ':' + graphitePass;
          if (creds.length > 1) {
            var bytes = Crypto.charenc.Binary.stringToBytes(creds);
            var base64 = Crypto.util.bytesToBase64(bytes);
            xhr.setRequestHeader('Authorization', 'Basic ' + base64);
          }
        },
        cache: false,
        dataType: 'json',
        error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
        hash: hash,
        target: myMatchedMetrics[target],
        url: graphiteUrl + '/render?target=' + myMatchedMetrics[target] + '&from=-' + myInterval + '&format=json'
      }).done(function(output) {
        if (output.length === 1) {
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
            stroke: false,
            series: [{ data: data, stroke: '#546c84' }]
          });
          graph.render();
          $('.metrics div#' + hash).append('<span id="' + this.target + '" class="target"></span>');
          $('.metrics div#' + hash + ' span.target').text(this.target);
          addMetricsToolbar(hash);

          // Restore our visual state
          selectActiveColumnButton();
          selectActiveIntervalButton();
          selectActiveMetrics();
          selectActiveSortButton();
          renderPreviewGraph();

          // Hide our loading div
          $('div.loading').addClass('hidden');

          // Clear search timer and bind infinite-scroll pagination
          clearTimeout(mySearchTimeoutId);
          $(window).on('scroll', scrollNextPage);

        } else {
          console.log("no data returned");
        }
      });
    }
  }
  // Disable infinite scrolling
  if (myPageIndex * myMetricsPerPage > myMatchedMetrics.length) {
    myPageIndex = 0;
  }
};

// Real-time filter renders sparklines when keystroke timer exceeds 500ms
$(document).on('keyup', 'input.search-ahead', function() {
  clearTimeout(mySearchTimeoutId);
  clearGraphs();
  $('#search.alert').alert('close');
  var mySearchString = $(this).val();
  myMatchedMetrics = [];
  mySearchTimeoutId = setTimeout(function() {
    $.ajax({
      accepts: {'json': 'application/json'},
      cache: false,
      data: {'pattern': mySearchString},
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url:'/metrics/search'
    }).done(function(results) {
      myMatchedMetrics = results;
      if (myMatchedMetrics.length === 0) {
        $('div.metrics').before('<div id="search" class="alert">' + 'No matches found for <strong>' + mySearchString + '</strong>.');
      } else {
        renderSparklines();
      }
    })
  }, 500);
});

// Add metrics to array of items to graph
$('.metrics').on('click', 'div.rickshaw_graph.default', function() {
  var metric = {
    name: $(this).children('span.target').attr('id'),
    id: $(this).attr('id'),
    axis: 1
  };
  myMetrics[metric.id] = metric;
  $(this).removeClass('default').addClass('selected');
  $('button.metrics_graph_submit').removeClass('disabled');
  $('input.new-graph-name').removeAttr('disabled');
  renderPreviewGraph();
  return false;
});

// Set per-metric axis
$('.metrics').on('click', '.rickshaw_graph.selected .options a.axis', function(e) {
  e.stopImmediatePropagation();
  axis = $(this).html();
  id = $(this).parent('div.options').parent('div.rickshaw_graph.selected').attr('id');
  myMetrics[id].axis = parseInt(axis);
  $('.metrics .rickshaw_graph.selected#' + id + ' .options a.axis').removeClass('selected');
  $($('.metrics .rickshaw_graph.selected#' + id + ' .options a.axis')[axis - 1]).addClass('selected');
  renderPreviewGraph();
  return false;
});

// Remove metrics from array of items to graph
$('.metrics').on('click', 'div.rickshaw_graph.selected', function() {
  delete myMetrics[$(this).attr('id')];
  $(this).find('.options a.axis').removeClass('selected');
  $(this).find('.options a.axis.left').addClass('selected');
  $(this).removeClass('selected').addClass('default');
  if (Object.keys(myMetrics).length === 0) {
    $('button.metrics_graph_submit').addClass('disabled');
    $('input.new-graph-name').attr('disabled', true);
  }
  renderPreviewGraph();
  return false;
});

// Create new graph on submit
$('#metrics_graph_select ul li').on('click', 'button.metrics_graph_submit', function() {
  var name = $(this).parent('li').parent('ul').find('input.new-graph-name').val();
  if (name.length > 0) {
    var url = $('span.graph#metrics_graph_preview img').attr('src');
    submitGraph({node: url, name: name}, function(graph) {
      window.location.href = '/graphs/' + graph.uuid
    });
  }
  return false;
});

// Create new graph on enter
$('#metrics_graph_select ul li').on('keypress', 'input.new-graph-name', function(e) {
  if (e.which === 13) {
    var name = $(this).parent('li').parent('ul').find('input.new-graph-name').val();
    var url = $('span.graph#metrics_graph_preview img').attr('src');
    submitGraph({node: url, name: name}, function(graph) {
      window.location.href = '/graphs/' + graph.uuid
    });
  }
});

// Paginate when we hit the bottom of the page
var scrollNextPage = function() {
  // Do not paginate under the following conditions:
  //   * we're already at the end of the document (myPageIndex === 0)
  //   * we're searching on tags (mySearchString.length > 0)
  if ((myPageIndex > 0) && (mySearchString.length === 0)) {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
      var now = +(new Date);
      var threshold = 2000;
      var delta = now - this.lastCall;
      if (!this.lastCall || (delta > threshold)) {
        this.lastCall = now;
        myPageIndex += 1;
        console.log("loading more metrics, myPageIndex is now " + myPageIndex);
        renderGraphs();
      } else {
        console.log("throttling");
      }
    }
  }
};
