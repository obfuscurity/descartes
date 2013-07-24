
// Grab configuration blob and construct our graph urls
var renderGraphs = function() {

  // Show our loading div
  $('div.loading').removeClass('hidden');

  var myUrl = '/graphs';
  if (mySearchString.length > 0) {
    myUrl += '?search=' + encodeURI(mySearchString);
  }
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {'page': myPageIndex, 'sort': encodeURI($.url().param('sort'))},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (d.length === 0) {
      console.log('No graphs found');
      // Disable infinite scrolling
      myPageIndex = 0;
    } else {
      var row = 0;
      for (var i in d) {
        var targets = [];
        var mergedConfig = $.extend({}, $.parseJSON(d[i].configuration), $.parseJSON(d[i].overrides));
        for (var j in mergedConfig.target) {
          targets.push({name: mergedConfig.target[j]});
        }
        var c = $.extend(mergedConfig, {targets: targets});
        if ((i % myColumns ) === 0) {
          $('div.graphs').append('<div class="row"></div>');
        }
        row = myRowIndex + Math.floor( i / myColumns );
        var spanSize = ( 12 / myColumns );
        $($('div.graphs div.row')[row]).append('<span id="' + d[i].uuid + '" class="graph span' + spanSize + '"></div>');
        $('div.graphs div.row span#' + d[i].uuid).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
        $('div.graphs div.row span#' + d[i].uuid).append('<a href="/graphs/' + d[i].uuid + '"><img src="' + constructGraphUrl(c) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" /></a>');
        $('div.graphs div.row span.graph img').load(function() {
          // hide spinner on successful load
          $(this).parent('a').parent('span').css('background-image', 'none')
        }).error(function() {
          console.log('failed to load ' + $(this)[0].name);
          var broken_img = $(this);
          // hide spinner and set background color
          broken_img.css('display', 'none');
          broken_img.parent('a').parent('span').css('background-image', 'none').css('background-color', '#eee')
          broken_img.parent('a').parent('span').find('label').css('margin', '10px 0 0 15px');
          // change label and link to image profile
          broken_img.parent('a').parent('span').find('label').html('Unable to load <a href="/graphs/' + broken_img[0].name + '">' + broken_img[0].alt + '</a>');
        });
      }
    }
    selectActiveColumnButton();
    selectActiveSortButton();
    selectActiveIntervalButton();
    myRowIndex = row;
    setImageDestroyMode();
    renderTitle();

    // Hide our loading div
    $('div.loading').addClass('hidden');

    // Bind infinite-scroll pagination
    $(window).on('scroll', scrollNextPage);
  });
};

// Traverse Graphite navigation tree for saved graphs
var treeversal = function(cb, node) {
  var prefix = "";
  var data = [];
  if (node == null) {
    node = "";
  }
  if (node === "") {
    prefix = "*";
  } else {
    prefix = node + ".*";
  }
  return $.ajax({
    beforeSend: function(xhr) {
      var creds = graphiteUser + ':' + graphitePass;
      if (creds.length > 1) {
        var bytes = Crypto.charenc.Binary.stringToBytes(creds);
        var base64 = Crypto.util.bytesToBase64(bytes);
        xhr.setRequestHeader('Authorization', 'Basic ' + base64);
      }
    },
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: graphiteUrl + "/browser/usergraph/?query=" + prefix + "&format=treejson&contexts=1&path=" + node
  }).done(function(d) {
    for (var i in d) {
      if (d[i].leaf === 0) {
        treeversal(cb, d[i].id);
      } else {
        if (d[i].id !== "no-click") {
          data.push(d[i]);
        }
      }
    }
    if (data.length > 0) return cb(data);
  });
};

// Invert "Import Graphs" button mode when activated
// Populate "Import Saved Graphs" select field
$(window).on('click', 'a.import.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    $('form#graph_select ul li select option').remove();
    treeversal(function(data) {
      var output = '';
      for (var i in data) {

        // Replace our stored URL with our actual graphiteUrl
        var url = URI(graphiteUrl)
                    .resource(URI(data[i].graphUrl).resource())
                    .addSearch({ name: data[i].text })
                    .normalizeSearch();

        var owner = data[i].id.split(".")[0];
        output += '<option value="' + url + '">' + data[i].text + ' (' + owner + ')' + "</option>\n";
      }
      $('#import_form select').append($(output));
    });
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Import').addClass('btn-inverse');
  } else {
    $(this).text('Import Graphs').removeClass('btn-inverse');
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
      var threshold = 100;
      var delta = now - this.lastCall;
      if (!this.lastCall || (delta > threshold)) {
        this.lastCall = now;
        myPageIndex += 1;
        myRowIndex += 1;
        renderGraphs();
      } else {
        console.log("throttling");
      }
    }
  }
};

