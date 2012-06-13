$(document).ready(function() {

  $(".graphite-add").click(function(e) {
    e.preventDefault();
    $("fieldset#graphite-add_form").toggle();
    $("fieldset#graphite-add_neck").toggle();
    $(".graphite-add").toggleClass("form-open");
  });

  $("fieldset#graphite-add_form").mouseup(function() {
    return false
  });
  $("fieldset#graphite-add_neck").mouseup(function() {
    return false
  });
  $(document).mouseup(function(e) {
    if($(e.target).parent("a.graphite-add").length==0) {
      $(".graphite-add").removeClass("form-open");
      $("fieldset#graphite-add_form").hide();
      $("fieldset#graphite-add_neck").hide();
    }
  });            

  var treeversal = function(cb, node) {
    if (node == null) { node = ""; }
    var prefix = "";
    if (node === "") {
      prefix = "*";
    } else {
      prefix = node + ".*";
    }
    var graphiteUrl = $.url($("#graphite_url").val()).attr('source');
    var uri = "/browser/usergraph/?query=" + prefix + "&format=treejson&contexts=1&path=" + node;
    var auth = 'Basic Z3JhcGhpdGU6aXBoZ2VpcGJlMUdyYWdDdWFyYkFjT2xzaG9mQWltY2k=';
    var data = [];
    return $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp',
      beforeSend: function(xhr) { xhr.setRequestHeader("Authorization", auth); },
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: graphiteUrl + uri
    }).done(function(d) {
      for (var i=0; i < d.length; i++) {
        if (d[i].leaf === 0) {
          treeversal(cb, d[i].id);
        } else {
          if (d[i].id !== "no-click") data.push(d[i]);
        }
      }
      if (data.length > 0) return cb(data);
    });
  };

  treeversal(function(data) {
    var output = "";
    for (var i=0; i<data.length; i++) {
      var graphiteUrl = $.url($("#graphite_url").val());
      var oldUrl = $.url(encodeURI(data[i].graphUrl));
      var newUrl = graphiteUrl.attr('source') + oldUrl.attr('relative');
      output += '<option value="' + data[i].text + '!:!' + newUrl + '">' + data[i].id + "</option>\n";
    }
    $("#graphite-add_form select").append($(output));
  });

});

