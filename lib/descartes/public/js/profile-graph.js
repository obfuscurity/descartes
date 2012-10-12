
// Select our active lineMode choice
var selectLineModeButton = function() {
  var index = $($('.line_mode.btn-group button.line_mode.btn[value="' + myLineMode + '"]')).attr('name');
  $('.line_mode.btn-group button.line_mode.btn.active').removeClass('active');
  $($('.line_mode.btn-group button.line_mode.btn')[index]).addClass('active');
};

// Select our active areaMode choice
var selectAreaModeButton = function() {
  var index = $($('.area_mode.btn-group button.area_mode.btn[value="' + myAreaMode + '"]')).attr('name');
  $('.area_mode.btn-group button.area_mode.btn.active').removeClass('active');
  $($('.area_mode.btn-group button.area_mode.btn')[index]).addClass('active');
};

// Select our active logMode choice
var selectLogModeButton = function() {
  var index = $($('.log_mode.btn-group button.log_mode.btn[value="' + myLogMode + '"]')).attr('name');
  $('.log_mode.btn-group button.log_mode.btn.active').removeClass('active');
  $($('.log_mode.btn-group button.log_mode.btn')[index]).addClass('active');
};

// Select our active drawNullAsZero choice
var selectNullModeButton = function() {
  var index = $($('.null_mode.btn-group button.null_mode.btn[value="' + myNullMode + '"]')).attr('name');
  $('.null_mode.btn-group button.null_mode.btn.active').removeClass('active');
  $($('.null_mode.btn-group button.null_mode.btn')[index]).addClass('active');
};

// Store our updated settings
var updateGraph = function(cb) {
  var myUrl = window.location.pathname;
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {
      'overrides': {
        'lineMode': myLineMode,
        'areaMode': myAreaMode,
        'logBase': myLogMode,
        'drawNullAsZero': myNullMode
      }
    },
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'PUT',
    url: myUrl
  }).done(function(d) {
    console.log('Graph ' + window.location.pathname.split('/').pop() + ' successfully updated');
    cb();
  });
};

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
    updateLocalSettings($.extend($.parseJSON(d.configuration), $.parseJSON(d.overrides)));
    var targets = [];
    for (var i in $.parseJSON(d.configuration).target) {
      targets.push({name: $.parseJSON(d.configuration).target[i]});
    }
    var c = $.extend($.parseJSON(d.configuration), $.parseJSON(d.overrides), {height: 300, options: '&hideLegend=false', targets: targets});
    $('div.graphs').append('<div class="row"></div>');
    $('div.graphs div.row').append('<div class="graph"></div>');
    $('div.graphs div.row div.graph').append('<div class="preview span12"></div>');
    $('div.graph div.preview').append('<img src="' + constructGraphUrl(c) + '" alt="' + d.name + '" name="' + d.uuid + '" />');
    selectActiveIntervalButton();
    renderDescription(d.description);
    renderTags();
    selectLineModeButton();
    selectAreaModeButton();
    selectLogModeButton();
    selectNullModeButton();
  });
};

// Populate our description box
var renderDescription = function(description) {
  if ((typeof description === 'string') && (description.length > 0)) {
    myDescription = description;
    $('span#description').text(description);
  } else {
    $('span#description').html('<span id="changeme">Click here to add your own description of this graph.</span>');
  }
};

// Reset description form
var resetDescriptionForm = function(desc) {
  $('div.description-wrapper span#description').removeClass('open').addClass('closed');
  $('div.description-wrapper span#description').children('textarea').remove();
  if ((typeof desc === 'string') && (desc.length > 0)) {
    $('div.description-wrapper span#description').text(desc);
  } else if (myDescription.length > 0) {
    $('div.description-wrapper span#description').text(myDescription);
  } else {
    $('div.description-wrapper span#description').append('<span id="changeme">Click here to add your own description of this graph.</span>');
  }
  $('div.description-wrapper a').remove();
  return false;
};

// Populate our tags box
var renderTags = function() {
  gatherTags(function(tags) { 
    $('div.tags-wrapper div.tags ul').remove();
    $('div.tags-wrapper div.tags span').remove();
    $('div.tags-wrapper div.tags').append('<ul></ul>');
    if ((typeof tags === 'object') && (tags.length > 0)) {
      for (var i in tags) {
        $('div.tags-wrapper div.tags ul').append('<li class="tag" id="' + tags[i].id + '"><a class="tag_delete" href="#"><i class="icon-minus-sign"></i></a> ' + tags[i].name + '</li>');
      }
    }
    $('div.tags-wrapper div.tags ul').append('<li class="tag"><a class="tag_add" href="#"><i class="icon-plus-sign"></i></a> <span class="tag_add">Add a new tag...</span></li>');
  });
};

// Delete a tag
var deleteTag = function(id, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: window.location.pathname + '/tags/' + id
  }).done(function(d) {
    console.log('Tag ' + id + ' successfully deleted');
    cb();
  });
};

// Add a tag
var addTag = function(name, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {'name': name},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: window.location.pathname + '/tags'
  }).done(function(d) {
    console.log('Tag ' + name + ' successfully added');
    cb();
  });
};

// Gather tags
var gatherTags = function(cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: window.location.pathname + '/tags'
  }).done(function(d) {
    cb(d);
  });
};

// Invert details button when opened
$('div.well').on('click', 'a.details.btn.closed', function() {
  $(this).text('Close Details').removeClass('closed').addClass('open').addClass('btn-inverse');
});

// Revert details button when closed
$('div.well').on('click', 'a.details.btn.open', function() {
  $(this).text('Details').removeClass('open').addClass('closed').removeClass('btn-inverse');
});

// Convert description span into editable textarea
$('div.description-wrapper').on('click', 'span.closed#description', function() {
  $(this).unbind('click').removeClass('closed').addClass('open');
  $(this).html('<textarea class="description span4" rows="10">' + myDescription + '</textarea>');
  $(this).after('<a class="description_submit btn btn-primary" href="#">Update Description</a>');
  $(this).after('<a class="description_cancel btn btn-inverse" href="#">Cancel</a>');
  $(this).children('textarea').focus().select();
  return false;
});

// Reset description element on cancel
$('div.description-wrapper').on('click', 'a.description_cancel', resetDescriptionForm);

// Update description on submit
$('div.description-wrapper').on('click', 'a.description_submit', function() {
  var newDescription = $(this).parent().children('span#description').children('textarea').val();
  myDescription = newDescription;
  updateObjectAttributes({ 'description': newDescription }, function() {
    resetDescriptionForm(newDescription);
  });
  return false;
});

// Delete tag from list
$('div.tags-wrapper').on('click', 'a.tag_delete i', function() {
  var myTagId = $(this).parent().parent('li').attr('id');
  deleteTag(myTagId, function() {
    renderTags();
  });
  return false;
});

// Convert tag span into editable field
$('div.tags-wrapper').on('click', 'a.tag_add i', function() {
  $(this).parent('a').parent('li').children('span.tag_add').html('<input class="input-medium" type="text" name="new_tag"></input>');
  $(this).addClass('open');
  $('input[name="new_tag"]').focus();
});

// Add new tag
$('div.tags-wrapper div.tags').on('keypress', 'span.tag_add input[name="new_tag"]', function(e) {
  if (e.which === 13) {
    var myNewTag = $(this).val();
    addTag(myNewTag, function() {
      renderTags();
    });
    return false;
  }
});

// Reset tag input field on focusout
// XXX Potential race condition in that we call GET twice...
// XXX first after adding a tag (above), then here on focusout.
// XXX Not really a race condition per se, but a wasted call nonetheless.
$('div.tags-wrapper div.tags').on('focusout', 'span.tag_add input[name="new_tag"]', function() {
  renderTags();
});

// Update lineMode on selection
$('.line_mode.btn-group button.line_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myLineMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update areaMode on selection
$('.area_mode.btn-group button.area_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myAreaMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update logMode on selection
$('.log_mode.btn-group button.log_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myLogMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update drawNullAsZero on selection
$('.null_mode.btn-group button.null_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myNullMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Not used in graph profile
var scrollNextPage = function() {
  return true;
}
