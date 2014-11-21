/* global bootbox */

$.widget("JL.topicTree", {
  options: {
    text: "Hallo",
    datasource: "/DokuSys/getList",
    dberror_func: ""
  },
  _create: function () {
    //bootbox.alert(this.element.attr('id')) 
    var _this = this;
    var $treeHead = $("<div class='clearfix'><button class='btn btn-info btn-xs pull-right'>Alle schliessen</button><button class='btn btn-info btn-xs pull-right'>Alle öffnen</button></div>").appendTo(this.element);
    $('button', $treeHead).click(function () { _this.collapseAll(); });
    var $tree = $("<div class='topicTree'></div>");
    $tree.appendTo(this.element);

    this._update();
    this._load($tree);
  },
  _setOption: function (key, value) {
    this.options[key] = value;
    this._update();
  },
  _update: function () {
    //this.element.html("<h1>" + this.options.text + "</h1>");
  },
  _tree: function (div) {
    $('.topicTree li:has(ul)').find(' > ul > li').hide(); //Alle zu
    $('.topicTree li:has(ul)').find('i:first').addClass('glyphicon-plus-sign');
    $('.topicTree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Zweig öffnen');

    $('.topicTree li > span').click(function () { console.log($(this).parent().attr("id")); });

    $('.topicTree li.parent_li > span i').on('click', function (e) {
      var children = $(this).parent().parent('li.parent_li').find(' > ul > li');
      if (children.is(":visible")) {
        children.hide('fast');
        $(this).attr('title', 'Zweig öffnen').find(' > i').addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
      } else {
        children.show('fast');
        $(this).attr('title', 'Zweig schliessen').find(' > i').addClass('glyphicon-minus-sign').removeClass('glyphicon-plus-sign');
      }
      e.stopPropagation();
    });
  },
  _load: function (div) {
    var _this = this;
    $.getJSON(this.options.datasource, function (data) {
      var tree = $("<ul></ul>");
      $.each(data.rows, function (key, obj) {
        var ntopic = $("<li id=topic" + obj.id + " data-json='" + JSON.stringify(obj) + "'><span><i class='glyphicon text-info'></i> " + obj.topic + "</span></li>");
        if (obj.parent > 0) {
          if ($('#topic' + obj.parent, tree).children("ul").length === 0) {
            $("<UL>").appendTo($('#topic' + obj.parent, tree));
          }
          $(ntopic).appendTo($('#topic' + obj.parent + " UL", tree));
        } else {
          $(ntopic).appendTo($(tree));
        }
      });
      div.html(tree);
      _this._tree();
    })
    .fail(function () {
      bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
    });
  },
  collapseAll: function () {
    $('.topicTree li:has(ul)').find(' > ul > li').hide("fast");
  }
});