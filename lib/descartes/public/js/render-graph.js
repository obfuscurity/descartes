
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
      // Disable infinite scrolling
      myPageIndex = 0;
    } else {
      var row = 0;
      for (var i=0; i < d.length; i++) {
        var targets = [];
        for (var j in $.parseJSON(d[i].configuration).target) {
          targets.push({name: $.parseJSON(d[i].configuration).target[j]});
        }
        var c = $.extend($.parseJSON(d[i].configuration), $.parseJSON(d[i].overrides), {targets: targets});
        if ((i % myColumns ) === 0) {
          $('div.graphs').append('<div class="row"></div>');
        }
        row = myRowIndex + Math.floor( i / myColumns );
        var spanSize = ( 12 / myColumns );
        $($('div.graphs div.row')[row]).append('<span id="' + d[i].uuid + '" class="graph span' + spanSize + '"></div>');
        $('div.graphs div.row span#' + d[i].uuid).append('<label for="' + d[i].uuid + '">' + d[i].name + '</label>');
        $('div.graphs div.row span#' + d[i].uuid).append('<a href="/graphs/' + d[i].uuid + '"><img src="' + constructGraphUrl(c) + '" alt="' + d[i].name + '" name="' + d[i].uuid + '" /></a>');
      }
    }
    selectActiveColumnButton();
    selectActiveIntervalButton();
    myRowIndex = row;
    setImageDestroyMode();
    renderTitle();
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
    dataType: 'jsonp',
    jsonp: 'jsonp',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: graphiteUrl + "/browser/usergraph/?query=" + prefix + "&format=treejson&contexts=1&path=" + node
  }).done(function(d) {
    for (var i=0; i < d.length; i++) {
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

// Reset our fieldset form and buttons
var resetFieldsetFormAndButtons = function(target) {
    $('fieldset.collapse').removeClass('in').css('height', '0px');
    $('fieldset.collapse' + target).addClass('in').css('height', 'auto');
    $('a.import.btn').text('Import Graphs').removeClass('btn-inverse');
    $('a.dashboard.btn').text('Add to Dashboard').removeClass('btn-inverse');
};

// Invert "Import Graphs" button mode when activated
// Populate "Import Saved Graphs" select field
$(window).on('click', 'a.import.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    $('form#graph_select ul li select option').remove();
    treeversal(function(data) {
      var output = '';
      for (var i=0; i<data.length; i++) {
        var oldUrl = $.url(encodeURI(data[i].graphUrl + '&name=' + data[i].text));
        var newUrl = $.url(graphiteUrl).attr('source') + oldUrl.attr('relative');
        var owner = data[i].id.split(".")[0];
        output += '<option value="' + newUrl + '">' + data[i].text + ' (' + owner + ')' + "</option>\n";
      }
      $('#import_form select').append($(output));
    });
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Import').addClass('btn-inverse');
  } else {
    $(this).text('Import Graphs').removeClass('btn-inverse');
  }
});

// Invert "Add to Dashboard" button mode when activated
// Populate "Add to Selected Dashboards" select field
$(window).on('click', 'a.dashboard.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Dashboard').addClass('btn-inverse');
    $('#dashboard_select ul li select option').remove();
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/dashboards'
    }).done(function(results) {
      for (var i in results) {
        $('#dashboard_select ul li select').append('<option value="' + results[i].uuid + '">' + results[i].name + '</option>');
      }
    });
  } else {
    $(this).text('Add to Dashboard').removeClass('btn-inverse');
  }
});

// Form to create dashboard from current view
// Redirect to new dashboard on success
$('form#dashboard_new ul li').on('click', 'button.dashboard_submit', function() {
  var name = $('input.dashboard_name').val();
  var u = [];
  for (var i=0; i < $('span.graph label').length; i++) {
    u[i] = $($('span.graph label')[i]).attr('for')
  }
  var g_uuids = u.join(",");
  var myUrl = '/dashboards';
  $.ajax({
    accepts: {json: 'application/json'},
    data: {name: name, uuids: g_uuids},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: myUrl
  }).done(function(d) {
    console.log('Graphs successfully added to Dashboard ' + d.uuid);
    window.location.href = "/dashboards/" + d.uuid;
  });
  return false;
});

// Add current view to selected dashboard
// Redirect to dashboard on success
$('#dashboard_select ul li').on('click', 'button.dashboard_submit', function() {
  var uuid = $('#dashboard_select ul li select option:selected').val();
  var u = [];
  for (var i=0; i < $('span.graph label').length; i++) {
    u[i] = $($('span.graph label')[i]).attr('for')
  }
  var g_uuids = u.join(",");
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {uuids: g_uuids},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: '/dashboards/' + uuid + '/graphs'
  }).done(function() {
    console.log('Graphs successfully added to Dashboard ' + uuid);
    window.location.href = '/dashboards/' + uuid;
  });
  return false;
});

// Paginate when we hit the bottom of the page
$(window).scroll(function() {
  // Do not paginate under the following conditions:
  //   * we're already at the end of the document (myPageIndex === 0)
  //   * we're searching on tags (myTags.length > 0)
  if ((myPageIndex > 0) && (myTags.length === 0)) {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
      myPageIndex += 1;
      myRowIndex += 1;
      renderGraphs();
    }
  }
});

