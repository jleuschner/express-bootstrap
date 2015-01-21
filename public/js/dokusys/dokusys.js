/* global bootbox */
/* global handleError */

(function ($) {

  function fileIcon(ext) {
    switch (ext.toUpperCase()) {
      case "JPG": return "fa-file-image-o";
      case "DOC":
      case "DOCX": return "fa-file-word-o";
      case "XLS":
      case "XLSX": return "fa-file-excel-o";
      case "MSG": return "fa-envelope-o";
      case "PDF": return "fa-file-pdf-o";
      default: return "fa-file-o";
    }
  }


  /*------------------- topicTree -------------------------
  * Trigger:
  *   _click({id:id} 
  *
  */
  $.widget("JL.topicTree", {
    options: {
      datasource: "/DokuSys/topics/",
      showRoot: true,
      searchTools: true,
      keepRootOpen: true
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

      if (notempty) { _this._tree(); }

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
        if (data.err) {
          handleError(data.err);
        }
        var tree = $("<ul class='root'></ul>");
        if (_this.options.showRoot) { $("<li id='topic0'><span><i class='fa fa-home text-info'></i></span></li>").appendTo(tree); }
        var arr = data.rows;
        if (arr.length) {
          do {
            var obj = arr.shift();
            var tagTxt = obj.keywords ? "Schlagworte: " + obj.keywords : "Keine Schlagworte definiert";
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
        }

        $('.topicTree', _this.element).html(tree);
        _this._tree(cb);
      })
      .fail(function () {
        handleError({ code: "AJAX", text: "Datenquelle " + _this.options.datasource + " antwortet nicht!" });
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


  /*------------------- topicFileDlg -------------------------
  */
  $.widget("JL.topicFileDlg", {
    options: {
      url: "DokuSys/files",
      show: { duration: 0 },
      hide: { duration: 200 },
      topic_id: -1,
      link_id: -1,
      titel: "",
      version: "1.0"
    },
    _create: function () {
      var _this = this;
      $(this.element)
        .css({ display: "none", margin: 0 })
        .bind("contextmenu", function () {
          return false;
        });

      var $uploads = $("<form class='topicFileDlg well well-sm' enctype='multipart/form-data'></form>").appendTo(_this.element);
      $("<input type='text' name='topic_id' hidden></input>").appendTo($uploads);
      $("<input type='text' name='link_id' hidden></input>").appendTo($uploads);
      $("<div class='form-group'><div class='row'><div class='col-xs-9'><label>Titel</label><input class='form-control' tabindex='1' autofocus='autofocus' name='titel' type='text' placeholder='Titel'></input></div>"
        + "<div class='col-xs-3'><label>Version</label><input class='form-control' name='version' type='text' tabindex='2' placeholder='Titel'></input></div></div></div>").appendTo($uploads);
      $("<div class='form-group'><label>Datei</label><div class='input-group'><input id='anhang' class='form-control' name='anhang' type='file' tabindex='3' placeholder='Datei-Anhang'></input>"
          + "<span class='input-group-btn'><button type='submit' class='btn btn-primary' tabindex='4' title='Upload'><i class='fa fa-upload'></i></button>"
          + "<button id='btnAddFileCancel' type='button' class='btn btn-danger' tabindex='5' title='Abbrechen'><i class='fa fa-remove'></i></button></span></div>").appendTo($uploads);
      $('#btnAddFileCancel', _this.element).click(function () {
        _this._hide(_this.element, _this.options.hide, function () {
          _this.element.remove();
        });
      });
      $("[name=topic_id]", $uploads).val(_this.options.topic_id);
      $("[name=link_id]", $uploads).val(_this.options.link_id);
      $("[name=titel]", $uploads).val(_this.options.titel);
      $("[name=version]", $uploads).val(_this.options.version).mask("099.099.09");

      $uploads.bootstrapValidator({
        fields: {
          titel: { validators: {
            notEmpty: { message: "Datei-Titel muss angegeben werden!" }
          }
          },
          version: { validators: {
            notEmpty: { message: "Datei-Version muss angegeben werden!" }
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
        var formdata = new FormData(e.target);
        $.ajax({
          type: "POST",
          url: _this.options.url,
          data: formdata,
          contentType: false,
          processData: false,
          success: function (data) {
            if (data.err) {
              handleError(data.err);
            } else {
              _this._trigger("_finish", null, { err: "" });
            }
          }
        })
        .fail(function () {
          handleError({ code: "AJAX", text: "Datenquelle " + _this.options.datasource + " antwortet nicht!" });
        });
      });
      _this._show(_this.element, _this.options.show, function () {
        $("[name=titel]", _this.element).focus();
      });
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
      datasource: "/DokuSys/topics/"
    },
    _var: {
      id: 0,
      prev_id: 0
    },
    _create: function () {
      var _this = this;
      //this.element.addClass("topicDlg");
      $(this.element).bind("contextmenu", function () {
        return false;
      });



      // Normalanzeige
      var $show = $("<div class='topicShow'></div>").appendTo(_this.element);
      var $crumbs = $("<nav class='breadcrumbs small'><ul><li data-toggle='tooltip' data-placement='bottom' title='Wurzel (Kurzanleitung)' bcfix='1'><a href='#' data-id='0'><i class='fa fa-home'></i></a></li><li data-toggle='tooltip' data-placement='bottom' title='Neuer Artikel' bcfix='1'><a href='#' data-id='-1'><i class='fa fa-plus-square'></i></a></li></ul></nav>").prependTo($show);
      $crumbs.find("li").tooltip();
      $crumbs.find("a").click(function () { _this.load($(this).data("id")); });
      $("<h1  name='topic'>Thema</h1>").appendTo($show);
      $("<div class='topictext' name='topictext' style='background-color:#fbfbfb;'></div>").appendTo($show);

      // Editieren ID0: Kurzanleitung
      //$("<a href='#'>Edit</a>").click(function () { _this._editMode(true); }).appendTo($show);

      _this._createForm();
      this._update();
      this.load(0);
    },
    _createForm: function () {
      var _this = this;
      var $form = $("<form id='topicDlgForm' class='topicEdit hidden'></form>").appendTo(_this.element);
      //$("<input name='id' class='hidden'></input>").appendTo($form);
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
          //if (topic.id !== $("input[name=id]", _this.element).val()) {
          if (topic.id !== _this._var.id) {
            $('input[name=parent]', _this.element).val(topic.id);
            $('#parentTree', _this.element).topicTree("markTopic", topic.id);
          }
        })
        .appendTo($p2c);

      $('#btnCancel', $form).click(function () {
        $("#Workspace").removeAttr("dirty");
        _this.load(_this._var.prev_id);
      });

      $("[name=keywords]").tagsinput();
      $('.summernote', _this.element).summernote({
        toolbar: [
              ['style', ['style', 'bold', 'italic', 'underline', 'strikethrough', 'clear']],
              ['misc', ['undo', 'redo']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['insert', ['table', 'picture', 'link', 'hr']],
              ['misc', ['fullscreen', 'codeview']]
              ],
        onImageUpload: function (files, editor, welEditable) {
          console.log("UPLOAD");
          console.log("TOPIC: " + _this._var.id);
          if (_this._var.id < 0) {
            bootbox.alert("Bilder können erst nach Anlage des Themas hinzugefügt werden.<br>Bitte zunächst speichern.");
          }
          /*
          data = new FormData();
            
          data.append("anhang", files[0]);
          $.ajax({
          data: data,
          type: "POST",
          url: '/dokusys/files',
          cache: false,
          contentType: false,
          processData: false,
          success: function(ret) {
          editor.insertImage(welEditable, "/dokusys/files/"+ret.id);
          }
          });
          */
          // scheisse, topic_id ist bei neuen Topics -1 !!!!
        }
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
        $.ajax({
          type: (_this._var.id > 0) ? "PUT" : "POST",
          url: _this.options.datasource + ((_this._var.id > 0) ? _this._var.id : ""),
          data: $(e.target).serialize(),
          success: function (data) {
            if (data.err) {
              handleError(data.err);
            } else {
              $("#Workspace").removeAttr("dirty");
              _this.load(data.id);
              _this._trigger("_change", null, { id: data.id });
            }
          }
        })
        .fail(function () {
          handleError({ code: "AJAX", text: _this.options.datasource + " nicht erreichbar!" });
        });
      });

      // Links
      $("<hr>").appendTo(_this.element);
      var $linksDIV = $("<div id='topicDlgAnhang' class='hidden'><div class='hr-xs'><h4 class='inline'>Anhänge</h4>"
        + "<span class='pull-right'><button id='btnAddFile' class='btn btn-xs btn-primary' title='Anhang hinzufügen'><i class='fa fa-plus'></i> <i class='fa fa-file-o'></i></button></span>"
        + "</div></div>").appendTo(_this.element);
      $("<div id='links' style='background:#fff'></div>").appendTo($linksDIV);
      $('#btnAddFile', _this.element).click(function () {
        _this._removeFileDlg();
        $('#links', _this.element)
          .before($("<div style='display:none'></div>")
            .topicFileDlg({ topic_id: _this._var.id })
            .on("topicfiledlg_finish", function () { _this.load(_this._var.id); })
            );
        $('[name=titel]', $linksDIV).focus();
      });
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
    },
    _removeFileDlg: function () {
      $(".topicFileDlg", this.element).remove();
    },
    _editMode: function (enable) {
      var _this = this;
      _this._removeFileDlg();
      if (enable) {
        $("#Workspace").attr("dirty", "1");
        $("#topicDlgAnhang", _this.element).addClass('hidden');
        $('.topicShow', _this.element).addClass('hidden');
        $('.topicEdit', _this.element).removeClass('hidden');
        $("#WsTabs a:first", _this.element).tab("show");

      } else {
        if (_this._var.id > 0) { $("#topicDlgAnhang", _this.element).removeClass('hidden'); }
        $('.topicEdit', _this.element).addClass('hidden');
        $('.topicShow', _this.element).removeClass('hidden');
      }
    },
    load: function (id) {
      var _this = this;
      if (id === -1) {
        _this._var.prev_id = _this._var.id;
        _this._var.id = -1;
        $("[name=parent]", _this.element).val(_this._var.prev_id);

        //_this._var.id = $("[name=id]", _this.element).val();
        //$("[name=parent]", _this.element).val(_this._var.id);
        //$("[name=id]", _this.element).val(-1);
        $('[name=keywords]').tagsinput('removeAll');
        $('.summernote[name=topictext]').code("");
        $("form", _this.element).bootstrapValidator('resetForm', true);
        _this._editMode(true);
        return;
      }
      _this._var.id = id;
      _this._var.prev_id = id;

      $.getJSON(this.options.datasource + id, function (data) {
        if (data.err) {
          handleError(data.err);
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

          // Anhaenge bei Root ausblenden
          if (id < 1) {
            $("#topicDlgAnhang", _this.element).addClass('hidden');
          } else {
            $("#topicDlgAnhang", _this.element).removeClass('hidden');
            //$("#uploads", _this.element).hide();
          }


          // Links:
          $("#links", _this.element).empty();
          $.each(data.rows[0].links, function (key, obj) {
            if (obj.typ === "FILE") {
              if ($("#lnk" + obj.id, _this.element).length < 1) {
                $("<ul id='lnk" + obj.id + "'><li><span data-version='" + obj.version + "' data-titel='" + obj.bez + "' data-link_id='" + obj.id + "'> "
                  + "<a href='DokuSys/files/" + obj.file_id + "' target='_blank'><i class='fa " + fileIcon(obj.filename.split(".").pop()) + "'></i> " + obj.bez + "</a>"
                  + "<button type='button' class='btn btn-default btn-xs pull-right' data-lnk='" + obj.id + "' title='Neue Version zufügen'><i class='fa fa-plus'></i> <i class='fa fa-file-o'></i></button>"
                  + "<span class='badge pull-right toggle'>Ver." + obj.version + "</span>"
                  + "</span><ul></ul></li></ul>").appendTo("#links", _this.element);
              }
              $("<li><span class='fileversions'><a href='DokuSys/files/" + obj.file_id + "' target='_blank' ><span class='fa " + fileIcon(obj.filename.split(".").pop()) + "'></span><span>Version " + obj.version + "</span><span>" + obj.filetime + " - " + obj.fileuser + "</span></a>"
                + "<span class='pull-right'><button data-file_id='" + obj.file_id + "' class='btn btn-xs btn-danger' title='Anhang löschen'><i class='glyphicon glyphicon-trash'></i></button></span></span></li>").appendTo($("#lnk" + obj.id + " ul", _this.element));
            }
          });
          //$("a .fa").removeClass("fa-file-o").addClass("fa-plus");
          $("button[data-lnk]", _this.element).click(function () {
            _this._removeFileDlg();
            var myUL = $("#lnk" + $(this).data("lnk"));
            myUL.after($("<div></div>")
              .topicFileDlg({
                titel: $(this).parent().data('titel'),
                version: $(this).parent().data('version'),
                topic_id: _this._var.id,
                link_id: $(this).parent().data('link_id')
              })
              .on("topicfiledlg_finish", function () { _this.load(_this._var.id); })
              );
            $('[name=titel]', _this.element).focus();
          });


          // BTN: Version löschen
          $("button[data-file_id]").click(function () {
            var file_id = $(this).data('file_id');
            var $myLI = $(this).parents('li:not(:has(ul))');
            //console.log($myLI.parent().find('li').length)
            var txt = "<h3>" + $myLI.parents('li').find('[data-titel]').data('titel') + "</h3>"
              + "<b>" + $myLI.find('span:nth-of-type(2)').text() + "</b> - <i>" + $myLI.find('span:nth-of-type(3)').text() + "</i><br> wirklich löschen?";
            bootbox.confirm(txt, function (answ) {
              if (answ) {
                $.ajax({
                  type: "DELETE",
                  url: "/dokusys/files/" + file_id,
                  success: function (data) {
                    if (data.err) {
                      handleError(data.err);
                    } else {
                      _this.load(_this._var.id);
                    }
                  }
                })
                .fail(function () {
                  handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
                });

              }
            });
          });

          $("#links", _this.element).find(" > ul").uniTree({
            ExpandedIcon: '',
            ExpandedTitle: 'Dateiversionen verbergen',
            CollapsedIcon: '',
            CollapsedTitle: 'Dateiversionen anzeigen'
          });
        }
        //$("#WsTabs a:first", _this.element).tab("show");
        $("form", _this.element).bootstrapValidator('disableSubmitButtons', false);
        _this._editMode(false);
      })
      .fail(function () {
        handleError({ code: "AJAX", text: "Datenquelle " + _this.options.datasource + " antwortet nicht!" });
      });
    }

  });

} (jQuery));


//------------------------------ Loader -------------------------------
$(function () {


  $('#DokuSys_TopicTree')
    .topicTree()
    .on("topictree_click", function (e, topic) {
      $('#DokuSys_TopicDlg').topicDlg("load", topic.id);
    })
    .topicTree('load');
  $('#DokuSys_TopicDlg')
    .topicDlg()
    .on("topicdlg_change", function (e, topic) {
      $('#DokuSys_TopicTree').topicTree("load", function () {
        $('#DokuSys_TopicTree').topicTree("selectTopic", topic.id);
      });
    })
    .on("topicdlg_crumbclick", function (e, topic) {
      $('#DokuSys_TopicTree').topicTree("selectTopic", topic.id);
    });
});
