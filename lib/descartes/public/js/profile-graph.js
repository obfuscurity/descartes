// Store our current description here
var myDescription = '';

// Populate our description box
var renderDescription = function(description) {
  if ((typeof description === 'string') && (description.length > 0)) {
    myDescription = description;
    $('span#description').text(description);
  } else {
    $('span#description').html('<span id="changeme">Click here to add your own description of this graph.</span>');
  }
};

// Populate our tags box
var renderTags = function(tags) {
  $('div.tags-wrapper div.tags ul').remove();
  $('div.tags-wrapper div.tags span').remove();
  if ((typeof tags === 'object') && (tags.length > 0)) {
    $('div.tags-wrapper div.tags').append('<ul></ul>');
    for (var i in tags) {
      $('div.tags-wrapper div.tags ul').append('<li class="tag" id="' + tags[i].id + '"><a class="tag_delete" href="#"><i class="icon-remove-circle"></i></a> ' + tags[i].name + '</li>');
    }
  } else {
    $('div.tags-wrapper div.tags').append('<span id="changeme">Hey dude, how about adding some tags for this graph?</span>');
  }
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
    var c = $.parseJSON(d.configuration);
    var targets = "";
    for (var j=0; j < c.target.length; j++) {
      targets += '&target=' + c.target[j];
    }
    $('div.graphs').append('<div class="row"></div>');
    $('div.graphs div.row').append('<div class="graph"></div>');
    $('div.graphs div.row div.graph').append('<div class="preview span12"></div>');
    myGraphOptions = '';
    var myPreviewGraphHeight = myGraphHeight * 2;
    var myGraphWidth = $('div.graph div.preview').width();
    var myGraphUrl = graphiteUrl + '/render/?' + 'height=' + myPreviewGraphHeight + '&width=' + myGraphWidth + '&from=-' + myInterval + 'hours' + targets + '&' + myGraphOptions;
    $('div.graph div.preview').append('<img src="' + encodeURI(myGraphUrl) + '" alt="' + d.name + '" name="' + d.uuid + '" />');
    renderDescription(d.description);
    renderTags(d.tags);
    selectActiveIntervalButton();
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
  $(this).html('<textarea class="description span5" rows="10">' + myDescription + '</textarea>');
  $(this).after('<a class="description_submit btn btn-primary" href="#">Update Description</a>');
  $(this).after('<a class="description_cancel btn btn-inverse" href="#">Cancel</a>');
  $(this).children('textarea').focus().select();
  return false;
});

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

$('div.tags-wrapper').on('click', 'a.tag_delete i', function() {
  var myTagId = $(this).parent().parent('li').attr('id');
  deleteTag(myTagId, function() {
    gatherTags(function(tags) {
      renderTags(tags);
    });
  });
  return false;
});
