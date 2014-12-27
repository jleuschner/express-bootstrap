/* global bootbox */
/* global checkDirty */
/* global handleError */

(function ($) {
  $.widget("JL.CrudDlg", {
    options: {
      id: 0,
      api: "/templates/cruds/"
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      $("#btnEdit", this.element).click(function () {
        _this._editMode(true);
      });
      $("#btnDel", this.element).click(function () {
        bootbox.confirm("Element wirklich löschen?", function (ok) {
          if (ok) {
            $.ajax({
              type: "DELETE",
              url: _this.options.api + _this.options.id,
              success: function (data) {
                if (data.err) {
                  handleError(data.err);
                } else {
                  _this.load(0);
                  _this._trigger("_change", null, { err: "" });
                }
              }
            })
            .fail(function () {
              handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
            });
          }
        });
      });

      $("#contentForm", this.element).bootstrapValidator({
        fields: {
          crudtitle: { validators: {
            notEmpty: { message: "Titel muss angegeben werden!" }
          }
          },
          crudtext: { validators: {
            notEmpty: { message: "Text muss angegeben werden!" }
          }
          }
        }
      })
        .on('success.form.bv', function (e) {
          e.preventDefault();
          $.ajax({
            type: (_this.options.id > 0) ? "PUT" : "POST",
            url: _this.options.api + ((_this.options.id > 0) ? _this.options.id : ""),
            data: $(e.target).serialize(),
            success: function (data) {
              if (data.err) {
                handleError(data.err);
              } else {
                $("#Workspace").removeAttr("dirty");
                _this.load(data.id);
                _this._trigger("_change", null, { err: "" });
              }
            }
          })
          .fail(function () {
            handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
          });
        });
      $("#contentForm #btnCancel", _this.element).click(function () {
        checkDirty(function (ok) {
          if (ok) {
            if (_this.options.id < 0) { _this.options.id = 0; }
            _this.load(_this.options.id);
          }
        });
      });

      this.load(this.options.id);
    },
    _editMode: function (edit) {
      var _this = this;
      if (edit) {
        $("#Workspace").attr("dirty", "1");
        $("#contentForm [name='crudtitle']", _this.element).val($("#content [name='crudtitle']", _this.element).text());
        $("#contentForm [name='crudtext']", _this.element).val($("#content [name='crudtext']", _this.element).text());
        $("#content", _this.element).hide(0, function () {
          $("#contentForm", _this.element).show(0);
        });
      } else {
        $("#contentForm", _this.element).hide(0, function () {
          $("#content", _this.element).show(0);
        });
      }
    },
    load: function (id) {
      var _this = this;
      this.options.id = id;
      if (id === 0) {
        $("[id*=content]", this.element).hide();
        $("#about", this.element).show();
      } else {
        $("#about", this.element).hide();
        $("#contentForm", this.element).hide();
        $("#content", this.element).show();
        if (id < 0) {
          $("#content [name]", this.element).text("");
          _this._editMode(true);
        } else {
          $.getJSON(this.options.api + id, function (data) {
            if (data.err) {
              handleError(data.err);
              return;
            } else {
              $("#content [name='crudtitle']", this.element).text(data.rows[0].crudtitle);
              $("#content [name='crudtext']", this.element).text(data.rows[0].crudtext);
            }
          })
          .fail(function () {
            handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
          });
        }
      }
    }
  });


  $.widget("JL.CrudList", {
    options: {
      api: "/templates/cruds/"
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      $("#btnNeu", this.element).click(function () {
        _this._trigger("_click", null, { id: -1 });
      });
      $("ul", this.element)
        .outlookList()
        .on("outlooklist_click", function (e, o) {
          checkDirty(function (ok) {
            if (ok) {
              _this._trigger("_click", null, { id: $(o).data('id') });
            }
          });
        });
      this.load();
    },
    load: function () {
      var _this = this;
      $.getJSON(this.options.api, function (data) {
        if (data.err) {
          handleError(data.err);
          return;
        } else {
          var $list = $("ul", _this.element);
          $list.empty();
          $.each(data.rows, function (k, obj) {
            $("<li data-id=" + obj.id + "><div class='list-title'>" + obj.crudtitle + "</div><div class='list-subtitle'>" + obj.crudtext + "</div></li>").appendTo($list);
          });
          $list.outlookList("refresh");
        }
      })
        .fail(function () {
          handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
        });
    }
  });

} (jQuery));




$(function () {
  $(".WorkspaceLeft")
    .CrudList()
    .on("crudlist_click", function (e, o) {
      $(".WorkspaceRight").CrudDlg("load", o.id);
    });
  $(".WorkspaceRight")
    .CrudDlg()
    .on("cruddlg_change", function () {
      $(".WorkspaceLeft").CrudList("load");
    });
});

