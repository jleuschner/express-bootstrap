/* global bootbox */
(function ($) {
  /*------------------- topicTree -------------------------
  * Trigger:
  *   _click({id:id} 
  *
  */
  $.widget("JL.topicTree", {
    options: {
      datasource: "/DokuSys/getList",
      showRoot: true,
      searchTools: true,
      keepRootOpen: true,
      dberror_func: ""
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });

      var notempty = true;
      if (this.element.html().length === 0) {
        $("<div class='topicTree'></div>").appendTo(this.element);
        notempty = false;
      } else {
        this.element.wrap("<div class='topicTree'></div>");
      }

      if (_this.options.searchTools) {
        var $flt = $("<div class='input-group'><div>").prependTo(_this.element);
        $("<input id='inpTxt' class='form-control' type='text' placeholder='Suchbegriff'></input>")
        .appendTo($flt)
        .keyup(function () { _this.filterTopics($(this).val()); });
        var $fltbtn = $("<div class='input-group-btn'></div>").appendTo($flt);
        $("<button class='btn btn-default' type='button' tabindex='-1' data-toggle='tooltip' data-placement='bottom' title='Filter zurücksetzen'><i class='glyphicon glyphicon-remove text-danger'></i></button>")
        .appendTo($fltbtn)
        .tooltip()
        .click(function () {
          $('#inpTxt', _this.element).val("");
          _this.filterTopics("");
        });
        $("<button class='btn btn-default' type='button' data-toggle='tooltip' data-placement='bottom' title='Alle schliessen'><span class='glyphicon glyphicon-folder-close'></span></button>")
        .appendTo($fltbtn)
        .tooltip()
        .click(function () {
          _this.collapseAll();
        });
        $("<button class='btn btn-default' type='button' data-toggle='tooltip' data-placement='bottom' title='Alle öffnen'><span class='glyphicon glyphicon-folder-open'></button>")
        .appendTo($fltbtn)
        .tooltip()
        .click(function () {
          _this.expandAll();
        });
      }

      if (notempty) { _this._tree();  }

      this._update();
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
      //this.element.html("<h1>" + this.options.text + "</h1>");
    },
    _tree: function (cb) {
      var _this = this;
      $('#inpTxt', _this.element).val(""); //Filter löschen
      //$('.topicTree li:has(ul)', _this.element).find(' > ul > li').hide(); //Alle zu
      _this.collapseAll();
      $('.topicTree li:has(ul)', _this.element).find('i:first').addClass('glyphicon-plus-sign').attr('title', 'Zweig öffnen');
      $('.topicTree li:has(ul)', _this.element).addClass('parent_li').find(' > span');

      // Click!!!
      $('.topicTree li > span', _this.element).click(function () {
        _this.selectTopic($(this).parent());
        _this._trigger("_click", null, { id: $(this).parent().attr('id').replace(/topic/, "") });
      });

      var iSel = '.topicTree li.parent_li > span i';
      if (this.options.showRoot && this.options.keepRootOpen) {
        iSel = '.topicTree li.parent_li:not(#topic0) > span i';
      }
      $(iSel, _this.element).on('click', function (e) {
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
      if (cb) { cb(); }
    },
    setTree: function (obj, cb) {
      var _this = this;
      $('.topicTree', _this.element).html(obj);
      _this._tree(cb);
    },
    load: function (cb) {
      // cb wird an _tree(cb) durchgeleitet
      var _this = this;
      $.getJSON(this.options.datasource, function (data) {
        if (data.err && _this.options.dberror_func) {
          _this.options.dberror_func(data.err);
        }
        var tree = $("<ul class='root'></ul>");
        if (_this.options.showRoot) { $("<li id='topic0'><span><i class='fa fa-home text-info'></i></span></li>").appendTo(tree); }
        var arr = data.rows;
        do {
          var obj = arr.shift();
          var tagTxt = obj.keywords ? "Schlagworte: " + obj.keywords : "Keine Schlagworte definiert";
          //var ntopic = $("<li id=topic" + obj.id + " data-json='" + JSON.stringify(obj) + "' title='" + tagTxt + "'><span><i class='glyphicon text-info'></i> " + obj.topic + "</span></li>");
          var ntopic = $("<li id=topic" + obj.id + " title='" + tagTxt + "'><span><i class='glyphicon text-info'></i> " + obj.topic + "</span></li>");
          if (obj.parent === 0 && _this.options.showRoot === false) {
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

        $('.topicTree', _this.element).html(tree);
        _this._tree(cb);
      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    },
    collapseAll: function () {
      if (this.options.showRoot && this.options.keepRootOpen) {
        $('.topicTree #topic0 li:has(ul)', this.element).find(' > ul > li').hide();
      } else {
        $('.topicTree li:has(ul)', this.element).find(' > ul > li').hide();
      }
    },
    expandAll: function () {
      $('.topicTree li:has(ul)', this.element).find(' > ul > li').show();
    },
    selectTopic: function (sel) {
      if ($.isNumeric(sel)) { sel = "#topic" + sel; }
      $(".topicTree li.selected", this.element).removeClass("selected");
      $(sel, this.element).addClass("selected");
      $(sel, this.element).parents('li').find(' > ul > li').show();
    },
    markTopic: function (sel) {
      if ($.isNumeric(sel)) { sel = "#topic" + sel; }
      $(".topicTree li.marked", this.element).removeClass("marked");
      $(sel, this.element).addClass("marked");
      $(sel, this.element).parents('li').find(' > ul > li').show();
      $(sel, this.element).find('li').show();
    },
    filterTopics: function (txt) {
      if (!txt) {
        $(".topicTree li", this.element).removeClass("filtered");
      } else {
        txt = txt.toLowerCase();
        $(".topicTree li:not(#topic0)", this.element)
          .addClass("filtered")
          .filter(function () {
            if ($(this).attr("title").toLowerCase().indexOf(txt) >= 0) { return true; }
            if ($(this).find("span").text().toLowerCase().indexOf(txt) >= 0) { return true; }
            return false;
          })
          .each(function () {
            $(this).parents('li').find(' > ul > li').show();
            $(this).parents("li.parent_li").removeClass("filtered").show();
            $(this).removeClass("filtered").show();
          });
      }
    }
  });


  /*------------------- topicDlg -------------------------
  * Trigger:
  *   _change({id:id} nach set
  *   _crumbclick({id:id}) bei Click auf breadcrumbs 
  *
  */
  $.widget("JL.topicDlg", {
    options: {
      datasource: "/DokuSys/get",
      dberror_func: ""
    },
    _var: {
      id: 0
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });

      // Normalanzeige
      var $show = $("<div class='topicShow'></div>").appendTo(_this.element)
      var $crumbs = $("<nav class='breadcrumbs small'><ul><li data-toggle='tooltip' data-placement='bottom' title='Wurzel (Kurzanleitung)' bcfix='1'><a href='#' data-id='0'><i class='fa fa-home'></i></a></li><li data-toggle='tooltip' data-placement='bottom' title='Neuer Artikel' bcfix='1'><a href='#' data-id='-1'><i class='fa fa-plus-square'></i></a></li></ul></nav>").prependTo($show);
      $crumbs.find("li").tooltip();
      $crumbs.find("a").click(function () { _this.load($(this).data("id")); });
      $("<h1  name='topic'>Thema</h1>").appendTo($show);
      $("<div name='topictext' style='background-color:#fbfbfb;'></div>").appendTo($show);

      // Editieren ID0: Kurzanleitung
      //$("<a href='#'>Edit</a>").click(function () { _this._editMode(true); }).appendTo($show);

      _this._createForm();
      this._update();
      this.load(0);
    },
    _createForm: function () {
      var _this = this;
      var $form = $("<form id='topicDlgForm' class='topicEdit hidden'></form>").appendTo(_this.element);
      $("<input name='id' class='hidden'></input>").appendTo($form);
      $("<input name='parent' class='hidden'></input>").appendTo($form);

      var $tabpanel = $("<div role='tabpanel'></div").appendTo($form);
      var $tabpaneltabs = $("<ul id='WsTabs' class='nav nav-tabs' role='tablist'></ul>").appendTo($tabpanel);
      $("<li role='presentation'><a href='#panel1' aria-controls='panel1' role='tab' data-toggle='tab'>Thema</a></li>").appendTo($tabpaneltabs).tab('show');
      $("<li role='presentation'><a href='#panel2' aria-controls='panel2' role='tab' data-toggle='tab'>Position</a></li>").appendTo($tabpaneltabs);
      $("<span class='pull-right'><button class='btn btn-success' type='submit'>Speichern</button> <button id='btnCancel' class='btn btn-danger' type='button'>Abbrechen</button></span>").appendTo($tabpaneltabs);


      var $wscontent = $("<div class='tab-content'></div>").appendTo($tabpanel);
      var $panel1 = $("<div role='tabpanel' id='panel1' class='tab-pane active'></div>").appendTo($wscontent);
      $("<div class='form-group'><label>Thema</label><input class='form-control' name='topic' type='text' placeholder='Thema-Überschrift'></input></div>").appendTo($panel1);
      $("<div class='form-group'><label>Schlagworte</label><input class='form-control' name='keywords' type='text' data-role='tagsinput'></input></div>").appendTo($panel1);
      $("<div class='form-group'><label>Text</label><textarea class='form-control summernote topicEditor' name='topictext'></textarea></div>").appendTo($panel1);

      var $panel2 = $("<div role='tabpanel' id='panel2' class='tab-pane'></div>").appendTo($wscontent);
      var $p2c = $("<div class='col-sm-8' style='margin-top:10px;'></div>").appendTo($panel2);
      $("<h4>Thema verschieben</h4><p>Bitte neuen Elternknoten auswählen:</p>").appendTo($p2c);
      $("<div id='parentTree'></div>")
        .topicTree({ showRoot: true })
        .on("topictree_click", function (e, topic) {
          if (topic.id !== $("input[name=id]", _this.element).val()) {
            $('input[name=parent]', _this.element).val(topic.id);
            $('#parentTree', _this.element).topicTree("markTopic", topic.id);
          }
        })
        .appendTo($p2c);

      $('#btnCancel', $form).click(function () {
        _this.load(_this._var.id);
      });

      $("[name=keywords]").tagsinput();
      $('.summernote', _this.element).summernote({
        toolbar: [
              ['style', ['style', 'bold', 'italic', 'underline', 'strikethrough', 'clear']],
              ['misc', ['undo', 'redo']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['insert', ['table', 'picture', 'link']],
              ['misc', ['fullscreen', 'codeview']]
              ]
      });

      $form.bootstrapValidator({
        fields: {
          topic: { validators: {
            notEmpty: { message: "Artikel-Überschrift muss angegeben werden!" }
          }
          },
          keywords: { validators: {
            callback: { message: "-", callback: function () { return true; } }
          }
          },
          topictext: { validators: {
            callback: { message: "-", callback: function () { return true; } }
          }
          }
        }
      })
      .bootstrapValidator('revalidateField', 'topictext')
      .on('success.form.bv', function (e) {
        e.preventDefault();
        var $lform = $(e.target);

        $.each($lform.find(".summernote"), function () {
          $(this).val($(this).code());
        });

        console.log($lform.serialize());
        $.post('DokuSys/set', $lform.serialize(), function (data) {
          if (data.err) {
            bootbox.alert("FEHLER!");
          } else {
            _this._trigger("_change", null, { id: data.id });
            _this.load(data.id);

          }
        });
      });

      // Links
      $("<hr>").appendTo(_this.element);
      var $linksDIV = $("<div><h4>Anhänge</h4></div>").appendTo(_this.element);
      $("<div id='links'></div>").appendTo($linksDIV);


      // Uploads
      $("<hr>").appendTo(_this.element);
      var $uploads = $("<form id='uploads' class='topicShow' action='DokuSys/upload' method='post' enctype='multipart/form-data'></form>").appendTo(_this.element);
      $("<input type='text' name='id'></input>").appendTo($uploads);
      $("<div class='form-group'><label>Titel</label><input class='form-control' name='titel' type='text' placeholder='Titel'></input></div>").appendTo($uploads);
      $("<div class='form-group'><label>Datei</label><input id='anhang' class='form-control' name='anhang' type='file' placeholder='Datei-Anhang'></input></div>").appendTo($uploads);
      $("<button type='submit' class='btn btn-primary'>Upload</button>").appendTo($uploads);

      $uploads.bootstrapValidator({
        fields: {
          titel: { validators: {
            notEmpty: { message: "Datei-Titel muss angegeben werden!" }
          }
          },
          anhang: { validators: {
            notEmpty: { message: "Datei muss angegeben werden!" }
          }
          }
        }
      })
      .on('success.form.bv', function (e) {
        e.preventDefault();
        var $lform = $(e.target);
        console.dir($lform.serialize());
        var formdata = new FormData(e.target);
        /*
        $.each($('#anhang')[0].files, function (i, file) {
        console.log(i);
        formdata.append("file" + i, file);
        });
        */
        $.ajax({
          type: "POST",
          url: "DokuSys/upload",
          data: formdata,
          contentType: false,
          processData: false,
          success: function (data) {
            console.log(data);
            if (data.err) {
              bootbox.alert("FEHLER!");
            } else {
              //_this._trigger("_change", null, { id: data.id });
              //_this.load(data.id);
            }
          }
        });
      });



    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
    },
    _editMode: function (enable) {
      var _this = this;
      if (enable) {
        $('.topicShow', _this.element).addClass('hidden');
        $('.topicEdit', _this.element).removeClass('hidden');
        /*
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
        */
        $("#WsTabs a:first", _this.element).tab("show");

      } else {
        $('.topicEdit', _this.element).addClass('hidden');
        $('.topicShow', _this.element).removeClass('hidden');
        //$('.topicEditor', _this.element).destroy();
      }
    },
    load: function (id) {
      var _this = this;
      _this._editMode(false);
      if (id === -1) {
        _this._var.id = $("[name=id]", _this.element).val();
        $("[name=parent]", _this.element).val(_this._var.id);
        $("[name=id]", _this.element).val(id);
        $('[name=keywords]').tagsinput('removeAll');
        $("form", _this.element).bootstrapValidator('resetForm', true);
        _this._editMode(true);
        return;
      }
      _this._var.id = id;
      $.getJSON(this.options.datasource, { id: id }, function (data) {
        if (data.err && _this.options.dberror_func) {
          _this.options.dberror_func(data.err);
          return;
        }
        $(".breadcrumbs ul li[bcfix!=1]", _this.element).remove();
        if (id > 0) {
          $.each(data.rows[0].parents, function (key, obj) {
            $(".breadcrumbs ul li:first", _this.element).after($("<li><a href='#' data-id='" + obj.id + "' >" + obj.topic + "</a></li>"));
          });
          $(".breadcrumbs ul li:last", _this.element).before($("<li class='active' data-toggle='tooltip' data-placement='bottom' title='Artikel bearbeiten'><a href='#'><span class='fa fa-pencil-square-o'></span> " + data.rows[0].topic + "</a></li>"));
          $(".breadcrumbs ul li.active", _this.element).tooltip();
          $(".breadcrumbs li:not(.active)[bcfix!=1]", _this.element).find("a").click(function () {
            _this.load($(this).data("id"));
            _this._trigger("_crumbclick", null, { id: $(this).data("id") });
          });
          $(".breadcrumbs li.active", _this.element).find("a").click(function () {
            _this._editMode(true);
          });
        }
        if (data.rows.length) {
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
          $('[name=keywords]').tagsinput('removeAll');
          $('[name=keywords]').tagsinput('add', data.rows[0].keywords);
          $('.summernote[name=topictext]').code(data.rows[0].topictext);
          // tree
          //console.log(data.rows[0].parents[0].id);
          $('#parentTree', _this.element)
            .topicTree("setTree", $("#DokuSys_TopicTree .topicTree").clone(), function () {
              $('#parentTree', _this.element).topicTree("markTopic", (data.rows[0].parents[0]) ? data.rows[0].parents[0].id : 0);
              $('#parentTree #topic' + id + " ul", _this.element).remove();
            });
          if (id < 1) {
            $("#uploads", _this.element).addClass('hidden');
          }

          // Links:
          //console.log(JSON.stringify(data.rows[0].links));
          $("#links", _this.element).html("");
          $.each(data.rows[0].links, function (key, obj) {
            if (obj.typ === "FILE") {
              if ($("#lnk" + obj.id, _this.element).length < 1) {
                //$("<div id='lnk" + obj.id + "' class='topicTree'><span>" + obj.bez + " : " + obj.version + "</span><ul></ul></div>").appendTo("#links", _this.element);
                $("<ul id='lnk" + obj.id + "' class='topicTree'><li><span>" + obj.bez + " : " + obj.version + "</span></li><ul></ul></ul>").appendTo("#links", _this.element);
              }
              $("<li><span>Version " + obj.version + "</span></li>").appendTo($("#lnk" + obj.id + " ul", _this.element));
            }
          });
          $("#links", _this.element).find(".topicTree").topicTree();
        }
        //$("#WsTabs a:first", _this.element).tab("show");
        $("form", _this.element).bootstrapValidator('disableSubmitButtons', false);
      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    }

  });

} (jQuery));