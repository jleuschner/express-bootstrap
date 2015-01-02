/* global bootbox */
/* global checkDirty */
/* global handleError */

(function ($) {
  $.widget("JL.CrudDlg", {
    options: {
      id: 0,
      api: "/io/types/",
      api_classes: "/io/classes/",
      api_protocols: "/io/protocols/"
    },
    _loadClasses: function () {
      var _this = this;
      $.getJSON(this.options.api_classes, function (data) {
        if (data.err) {
          handleError(data.err);
          return;
        } else {
          $.each(data.rows, function () {
            $("<option value='" + this.id + "'>" + this.name + "</option>").appendTo($("[name='classes_id']"));
          })
          $("[name='classes_id']").chosen({ disable_search: true });
        }
      })
      .fail(function () {
        handleError({ code: "AJAX", text: _this.options.api_classes + " nicht erreichbar!" });
      });
    },
    _loadProtocols: function () {
      var _this = this;
      $.getJSON(this.options.api_protocols, function (data) {
        if (data.err) {
          handleError(data.err);
          return;
        } else {
          $.each(data.rows, function () {
            $("<option value='" + this.id + "'>" + this.name + "</option>").appendTo($("[name='protocols_id']"));
          })
          $("[name='protocols_id']").chosen({ disable_search: true });
        }
      })
      .fail(function () {
        handleError({ code: "AJAX", text: _this.options.api_protocols + " nicht erreichbar!" });
      });
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      _this._loadClasses();
      _this._loadProtocols();
      $("input[type='checkbox']")
        .iCheck({ checkboxClass: 'icheckbox_flat-blue' })
        .on("ifChecked", function () {
          $("[name='" + $(this).data("toggle") + "']", _this.element).removeAttr("disabled");
        })
        .on("ifUnchecked", function () {
          var inp = $("[name='" + $(this).data("toggle") + "']", _this.element);
          $("form", _this.element).bootstrapValidator('resetField', inp);
          inp.attr("disabled", "disabled").val("");
        });

      $("#btnEdit", this.element).click(function () {
        _this._editMode(true);
      });
      $("#btnDel", this.element).click(function () {
        bootbox.confirm("IO-Typ wirklich löschen?", function (ok) {
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
          name: { validators: {
            notEmpty: { message: "Typbezeichnung muss angegeben werden!" }
          }
          },
          remark: { validators: {
            notEmpty: { message: "Kurzbeschreibung muss angegeben werden!" }
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
        $("#contentForm [name='name']", _this.element).val($("#content [name='name']", _this.element).text());
        $("#contentForm [name='remark']", _this.element).val($("#content [name='remark']", _this.element).text());
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
            console.log(JSON.stringify(data))
            if (data.err) {
              handleError(data.err);
              return;
            } else {
              $("#content [name='name']", this.element).text(data.rows[0].name);
              $("#content [name='remark']", this.element).text("Beschreibung: "+data.rows[0].remark);
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
      api: "/io/types/"
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
            $("<li data-id=" + obj.id + "><div class='list-title'>" + obj.name + "</div><div class='list-subtitle'>" + obj.class +"  ["+obj.protocol+"]</div><div class='list-remark'>" + obj.remark + "</div></li>").appendTo($list);
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

