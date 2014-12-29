/* global bootbox */
/* global checkDirty */
/* global handleError */

(function ($) {
  $.widget("JL.DevicesDlg", {
    options: {
      id: 0,
      api: "/io/devices/"
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
        bootbox.confirm("Device wirklich löschen?", function (ok) {
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

      $("#deviceForm", this.element).bootstrapValidator({
        fields: {
          hostname: { validators: {
            notEmpty: { message: "Hostname muss angegeben werden!" }
          }
          },
          ip: { validators: {
            ip: { message: "Gültige IP-Adresse notwendig!" }
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
        })
        .find("[name='ip']").mask('099.099.099.099');
      $("#deviceForm #btnCancel", _this.element).click(function () {
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
        $("#deviceForm [name='hostname']", _this.element).val($("#device [name='hostname']", _this.element).text());
        $("#deviceForm [name='ip']", _this.element).val($("#device [name='ip']", _this.element).text());
        $("#device", _this.element).hide(0, function () {
          $("#deviceForm", _this.element).show(0);
        });
      } else {
        $("#deviceForm", _this.element).hide(0, function () {
          $("#device", _this.element).show(0);
        });
      }
    },
    load: function (id) {
      var _this = this;
      this.options.id = id;
      if (id === 0) {
        $("[id*=device]", this.element).hide();
        $("#about", this.element).show();
      } else {
        $("#about", this.element).hide();
        $("#deviceForm", this.element).hide();
        $("#device", this.element).show();
        if (id < 0) {
          $("#device [name]", this.element).text("");
          _this._editMode(true);
        } else {
          $.getJSON(this.options.api + id, function (data) {
            if (data.err) {
              handleError(data.err);
              return;
            } else {
              $("#device [name='hostname']", this.element).text(data.rows[0].hostname);
              $("#device [name='ip']", this.element).text(data.rows[0].ip);
            }
          })
          .fail(function () {
            handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
          });
        }
      }
    }
  });


  $.widget("JL.DevicesList", {
    options: {
      api: "/io/devices/"
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
            $("<li data-id=" + obj.id + "><div class='list-title'>" + obj.hostname + "</div><div class='list-subtitle'>" + obj.ip + "</div></li>").appendTo($list);
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
    .DevicesList()
    .on("deviceslist_click", function (e, o) {
      $(".WorkspaceRight").DevicesDlg("load", o.id);
    });
  $(".WorkspaceRight")
    .DevicesDlg()
    .on("devicesdlg_change", function () {
      $(".WorkspaceLeft").DevicesList("load");
    });
});

