
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

// Reset our fieldset form and buttons
var resetFieldsetFormAndButtons = function(target) {
    $('fieldset.collapse').removeClass('in').css('height', '0px');
    $('fieldset.collapse' + target).addClass('in').css('height', 'auto');
    $('a.import.btn').text('Import Graphs').removeClass('btn-inverse');
    $('a.dashboard.btn').text('Add to Dashboard').removeClass('btn-inverse');
};

// Invert "Import Graphs" button mode when activated
$(window).on('click', 'a.import.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Import').addClass('btn-inverse');
  } else {
    $(this).text('Import Graphs').removeClass('btn-inverse');
  }
});

// Invert "Add to Dashboard" button mode when activated
$(window).on('click', 'a.dashboard.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Cancel Dashboard').addClass('btn-inverse');
  } else {
    $(this).text('Add to Dashboard').removeClass('btn-inverse');
  }
});

// Form to create dashboard from current view
// Redirect to new dashboard on success
$(window).on('click', 'button.dashboard_submit', function() {
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
    window.location.href = "/dashboards/" + d.uuid;
  });
  return false;
});

// Populate our "Add to Dashboard" dropdown list
$('div.append.btn-group').on('click', 'button.append.dropdown-toggle', function() {
  // only execute on dropdown open, not on close
  if ($('div.append.btn-group.open').length === 0) {
    $('div.append.btn-group ul.append.dropdown-menu li').remove();
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: '/dashboards'
    }).done(function(results) {
      for (var i in results) {
        $('div.append.btn-group ul.append.dropdown-menu').append('<li class="append"><a id="' + results[i].uuid + '" href="#">' + results[i].name + '</a></li>');
      }
    });
  }
});

// Add current view to selected dashboard
// Redirect to dashboard on success
$('div.append.btn-group ul.append.dropdown-menu').on('click', 'li.append', function() {
  var uuid = $(this).children('a').attr('id');
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
    //error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    error: function(xhr, textStatus, errorThrown) { console.log(textStatus); },
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
