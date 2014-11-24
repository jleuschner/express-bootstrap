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

      var $treeHead = $("<div class='clearfix'><button class='btn btn-info btn-xs pull-right'>Alle schliessen</button><button class='btn btn-info btn-xs pull-right'>Alle öffnen</button></div>").appendTo(this.element);
      $('button:first', $treeHead).click(function () { _this.collapseAll(); });
      $('button:nth-child(2)', $treeHead).click(function () { _this.expandAll(); });
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
      $('.topicTree li:has(ul)').find('i:first').addClass('glyphicon-plus-sign');
      $('.topicTree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Zweig öffnen');

      $('.topicTree li > span').click(function () {
        console.log($(this).parent().attr("id"));
        $(_this.options.targetForm).topicDlg('load', $(this).parent().data('json').id);
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
    },
    expandAll: function () {
      $('.topicTree li:has(ul)').find(' > ul > li').show("fast");
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
      
      $(".breadcrumbs",_this.element).find("a").click( function(){ 
        _this.load( $(this).data("id")); 
      });
      $(".breadcrumbs",_this.element).find("li").tooltip(); 


      $('#btnEdit', this.element).click(function () {
        $('.topicShow', _this.element).addClass('hidden');
        $('.topicEdit', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).summernote();
      });
      $('#btnCancel', this.element).click(function () {
        $('.topicEdit', _this.element).addClass('hidden');
        $('.topicShow', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).destroy();
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
    _editMode: function(enable) {
      var _this = this;
      if (enable) {
        $('.topicShow', _this.element).addClass('hidden');
        $('.topicEdit', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).summernote();
      } else {
        $('.topicEdit', _this.element).addClass('hidden');
        $('.topicShow', _this.element).removeClass('hidden');
        $('.topicEditor', _this.element).destroy();
      }
    },
    load: function (id) {
      var _this = this;
      if (id === 0) {
        $('.topicRoot',this.element).removeClass('hidden');
        $('.topicWorkspace',this.element).addClass('hidden');
        return;
      } else {
        $('.topicRoot',this.element).addClass('hidden');
        $('.topicWorkspace',this.element).removeClass('hidden');
        if (id === -1) { 
          _this._editMode(true);
          return; 
        }
      }
      $('#btnCancel', this.element).click();
      $.getJSON(this.options.datasource, { id: id }, function (data) {
        if (data.err && _this.options.dberror_func) {
          _this.options.dberror_func(data.err);
          return;
        }
        $(".breadcrumb",_this.element).html("");
        $.each(data.rows[0].parents, function(key,obj){
          $("<li><a href='#' data-id='"+obj.id+"' >"+obj.topic+"</a></li>").prependTo( $(".breadcrumb",_this.element));  
        });
        $("<li class='active'>"+data.rows[0].topic+"</li>").appendTo( $(".breadcrumb",_this.element));  
        $(".breadcrumb",_this.element).find("a").click( function(){ 
          console.log( $(this).data("id") );
          _this.load( $(this).data("id")); });


        $.each(data.fields, function (key, fieldDef) {
          $.each($('[name=' + fieldDef.name + ']', this.element), function (key, obj) {
            switch ($(obj).prop('tagName')) {
              case 'INPUT' :
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