// traverse navigation tree for saved graphs
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
    url: url + "/browser/usergraph/?query=" + prefix + "&format=treejson&contexts=1&path=" + node
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

// populate our select field
treeversal(function(data) {
  var output = "";
  for (var i=0; i<data.length; i++) {
    var oldUrl = $.url(encodeURI(data[i].graphUrl));
    var newUrl = $.url(url).attr('source') + oldUrl.attr('relative');
    //console.log(data[i]);
    var owner = data[i].id.split(".")[0];
    console.log(owner);
    output += '<option value="' + data[i].text + '!:!' + newUrl + '">' + data[i].text + ' (' + owner + ')' + "</option>\n";
  }
  $("#import_form select").append($(output));
});

// show form on button click
$("a.import").click(function(e) {
  e.preventDefault();
  $("fieldset#import_form").toggle();
  $("a.import").toggleClass("form-open");
});

// hide form
$("fieldset#import_form").mouseup(function() {
  return false;
});
$(document).mouseup(function(e) {
  if ($(e.target).parent("a.import").length == 0) {
    $("a.import").removeClass("form-open");
    $("fieldset#import_form").hide();
  }
});            
