/* global bootbox */
(function ($) {
  //------------------- topicTree -------------------------
  $.widget("JL.topicTree", {
    options: {
      datasource: "/DokuSys/getList",
      dberror_func: "",
      targetForm: "#DokuSys_TopicDlg"
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });

      $('#btnTest').click(function () {
        _this.expandTopic('#topic219');
      });

      var $treeHead = $("<div class='clearfix'><button class='btn btn-default btn-xs pull-right' data-toggle='tooltip' data-placement='bottom' title='Alle schliessen'><span class='fa fa-angle-double-right'></span></button><button class='btn btn-default btn-xs pull-right'data-toggle='tooltip' data-placement='bottom' title='Alle öffnen'><span class='fa fa-angle-double-down'></span></button></div>").appendTo(this.element);
      $('button:first', $treeHead).tooltip().click(function () { _this.collapseAll(); });
      $('button:nth-child(2)', $treeHead).tooltip().click(function () { _this.expandAll(); });
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
      var _this = this;
      $('.topicTree li:has(ul)').find(' > ul > li').hide(); //Alle zu
      $('.topicTree li:has(ul)').find('i:first').addClass('glyphicon-plus-sign').attr('title', 'Zweig öffnen');
      $('.topicTree li:has(ul)').addClass('parent_li').find(' > span');

      $('.topicTree li > span').click(function () {
        console.log($(this).parent().attr('id').replace(/topic/, ""));
        $(_this.options.targetForm).topicDlg('load', $(this).parent().attr('id').replace(/topic/, ""));
      });

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
        if (data.err && _this.options.dberror_func) {
          _this.options.dberror_func(data.err);
        }
        var tree = $("<ul></ul>");
        var arr = data.rows;
        do {
          var obj = arr.shift();
          var tagTxt = obj.keywords ? "Schlagworte: " + obj.keywords : "Keine Schlagworte definiert";
          //var ntopic = $("<li id=topic" + obj.id + " data-json='" + JSON.stringify(obj) + "' title='" + tagTxt + "'><span><i class='glyphicon text-info'></i> " + obj.topic + "</span></li>");
          var ntopic = $("<li id=topic" + obj.id + " title='" + tagTxt + "'><span><i class='glyphicon text-info'></i> " + obj.topic + "</span></li>");
          if (obj.parent === 0) {
            $(ntopic).appendTo($(tree));
          } else {
            if ($('#topic' + obj.parent, tree).length) {
              if ($('#topic' + obj.parent, tree).children("ul").length === 0) {
                $("<UL>").appendTo($('#topic' + obj.parent, tree));
              }
              $(ntopic).appendTo($('#topic' + obj.parent + " UL", tree));
            } else {
              arr.push(obj);
            }
          }
        } while (arr.length);

        div.html(tree);
        _this._tree();
      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    },
    collapseAll: function () {
      $('.topicTree li:has(ul)').find(' > ul > li').hide("fast");
    },
    expandAll: function () {
      $('.topicTree li:has(ul)').find(' > ul > li').show("fast");
    },
    expandTopic: function (sel) {
      console.log("expand: " + $(sel).text())
      $(sel).parents('li').find(' > ul > li').show().addClass('text-danger');
    }

  });


  //------------------- topicDlg -------------------------
  $.widget("JL.topicDlg", {
    options: {
      id: 0,
      datasource: "/DokuSys/get",
      dberror_func: ""
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });

      var $crumbs = $("<nav class='breadcrumbs small'><ul><li data-toggle='tooltip' data-placement='bottom' title='Wurzel (Kurzanleitung)' bcfix='1'><a href='#' data-id='0'><i class='fa fa-home'></i></a></li><li data-toggle='tooltip' data-placement='bottom' title='Neuer Artikel' bcfix='1'><a href='#' data-id='-1'><i class='fa fa-plus-square'></i></a></li></ul></nav>")
        .prependTo(_this.element);
      $crumbs.find("li").tooltip();
      $crumbs.find("a").click( function(){ _this.load($(this).data("id")); })


      $('#btnCancel', this.element).click(function () {
        _this._editMode(false);
      });

      this._update();
      this.load(0);
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
      //this.element.html("<h1>" + this.options.text + "</h1>");
    },
    _editMode: function (enable) {
      var _this = this;
      if (enable) {
        $('.topicShow', _this.element).addClass('hidden');
        $('.topicEdit', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).summernote({
          toolbar: [
              ['style', ['style', 'bold', 'italic', 'underline', 'strikethrough', 'clear']],
              ['misc', ['undo', 'redo']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['insert', ['table', 'picture', 'link']],
              ['misc', ['fullscreen', 'codeview']]
              ]
        });
      } else {
        $('.topicEdit', _this.element).addClass('hidden');
        $('.topicShow', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).destroy();
      }
    },
    load: function (id) {
      var _this = this;
      if (id === 0) {
        $('.topicRoot', this.element).removeClass('hidden');
        $('.topicWorkspace', this.element).addClass('hidden');
        return;
      } else {
        $('.topicRoot', this.element).addClass('hidden');
        $('.topicWorkspace', this.element).removeClass('hidden');
        if (id === -1) {
          _this._editMode(true);
          return;
        }
      }
      $.getJSON(this.options.datasource, { id: id }, function (data) {
        if (data.err && _this.options.dberror_func) {
          _this.options.dberror_func(data.err);
          return;
        }
        $(".breadcrumbs ul li[bcfix!=1]", _this.element).remove();
        var crumbs = $(".breadcrumbs ul li", _this.element);
        $.each(data.rows[0].parents, function (key, obj) {
          //$("<li><a href='#' data-id='" + obj.id + "' >" + obj.topic + "</a></li>").prependTo($(".breadcrumbs ul", _this.element));
          $(".breadcrumbs ul li:first", _this.element).after($("<li><a href='#' data-id='" + obj.id + "' >" + obj.topic + "</a></li>"));
        });
        $(".breadcrumbs ul li:last", _this.element).before($("<li class='active' data-toggle='tooltip' data-placement='bottom' title='Artikel bearbeiten'><a href='#'><span class='fa fa-pencil-square-o'></span> " + data.rows[0].topic + "</a></li>"));
        $(".breadcrumbs ul li.active", _this.element).tooltip();
        $(".breadcrumbs li:not(.active)", _this.element).find("a").click(function () {
          _this.load($(this).data("id"));
        });
        $(".breadcrumbs li.active", _this.element).find("a").click(function () {
          _this._editMode(true);
        });


        $.each(data.fields, function (key, fieldDef) {
          $.each($('[name=' + fieldDef.name + ']', this.element), function (key, obj) {
            switch ($(obj).prop('tagName')) {
              case 'INPUT':
                $(obj).val(data.rows[0][fieldDef.name]);
                break;
              case 'DIV':
                $(obj).html(data.rows[0][fieldDef.name]);
                break;
              default:
                $(obj).text(data.rows[0][fieldDef.name]);
                break;
            }
          });
        });

      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    }

  });

} (jQuery));