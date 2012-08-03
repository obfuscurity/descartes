
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  var myUrl = '/graphs';
  if (myTags.length > 0) {
    myUrl += '?tags=' + encodeURI(myTags);
  }
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {'page': myPageIndex},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No graphs found');
      // disable infinite scrolling
      myPageIndex = 0;
    }
    var row = 0;
    for (var i=0; i < d.length; i++) {
      var c = $.parseJSON(d[i].configuration);
      var targets = "";
      for (var j=0; j < c.target.length; j++) {
        targets += '&target=' + c.target[j];
      }
      if ((i % myColumns ) === 0) {
        $('div.graphs').append('<div class="row"></div>');
      }
      row = myRowIndex + Math.floor( i / myColumns );
      console.log(row);
      var spanSize = ( 12 / myColumns );
      $($('div.graphs div.row')[row]).append('<span id="' + d[i].uuid + '" class="graph span' + spanSize + '"></div>');
      var myGraphWidth = $($('div.row span.graph')[0]).width();
      var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myGraphHeight + '&width=' + myGraphWidth + '&from=-' + myInterval + targets + '&' + myGraphOptions;
      var graphCloseIcon = '<img class="close hidden" src="/img/close.png" />';
      var graphViewIcon = '<a href="/graphs/' + d[i].uuid + '"><img class="view hidden" src="/img/view.png" /></a>';
      $('div.graphs div.row span#' + d[i].uuid).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
      $('div.graphs div.row span#' + d[i].uuid).append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" />');
      $('div.graphs div.row span#' + d[i].uuid).append(graphCloseIcon);
      $('div.graphs div.row span#' + d[i].uuid).append(graphViewIcon);
    }
    selectActiveColumnButton();
    selectActiveIntervalButton();
    myRowIndex = row;
  });
};

// Paginate when we hit the bottom of the page
$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() == $(document).height()) {
    if (myPageIndex > 0) {
      myPageIndex += 1;
      myRowIndex += 1;
      renderGraphs();
    }
  }
});
