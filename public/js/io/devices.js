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

      $("#btnIoAdd", _this.element).click(function () {
        _this._createIO({ id: '-1', name: 'Neue IO-Definition', klasse: '?', typ: '?', channel: '?' });
      });

      this.load(this.options.id);
    },
    _editMode: function (edit) {
      var _this = this;
      if (edit) {
        $("#Workspace").attr("dirty", "1");
        $("#deviceForm [name='hostname']", _this.element).val($("#device [name='hostname']", _this.element).text());
        $("#deviceForm [name='ip']", _this.element).val($("#device [name='ip']", _this.element).text());
        $("#deviceForm [name='remark']", _this.element).val($("#device [name='remark']", _this.element).text());
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

      this._createIOs([{ id: 2, name: 'Neuer IO', klasse: 'DimmDimm', typ: 'xCMD', channel: '3' }, { id: 3, name: 'Neuerer IO', klasse: 'Switch', typ: 'ECMD-IO', channel: '1/6'}]);

      if (id === 0) {
        $("[id*=device]", this.element).hide();
        //$("#ioDefinition", this.element).hide();
        $("#about", this.element).show();
      } else {
        $("#about", this.element).hide();
        $("#deviceForm", this.element).hide();
        $("#device", this.element).show();
        $("#ioDefinition", this.element).show();
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
              $("#device [name='remark']", this.element).text(data.rows[0].remark);
            }
          })
          .fail(function () {
            handleError({ code: "AJAX", text: _this.options.api + " nicht erreichbar!" });
          });
        }
      }
    },
    _createIO: function (io) {
      $("<div class='ioDef' data-id=" + io.id + "><div class='name'>" + io.name + "</div><div class='klasse'>" + io.klasse + "</div><div class='typ'>" + io.typ + "</div><div class='channel'>" + io.channel + "</div>"
        + "<div class='btn-group pull-right' role='group'>"
        + "<button class='btn btn-xs btn-danger btnDel' type='button' title='IO löschen'><i class='fa fa-trash'></i></button>"
        + "<button class='btn btn-xs btn-default btnEdit' type='button' title='IO bearbeiten'><i class='fa fa-pencil-square-o'></i></button>"
        + "</div></div>")
      .appendTo(".ioList", this.element);
    },
    _createIOs: function (ios) {
      var _this = this;
      $(".ioList", this.element).empty();
      $.each(ios, function (k, io) {
        _this._createIO(io);
      });
      $(".ioDef .btnEdit", this.element).click(function () {
        _this._editIO($(this).parent().parent().data("id"));
      });
    },
    _editIO: function (id) {
      var klassen = [{ id: 1, name: 'Dimmer' }, { id: 2, name: 'OnOff'}];
      var $div = $(".ioDef[data-id='" + id + "']");
      var $form = $("<form>"
        + "<div class='form-group'><label>IO-Bezeichnung</label><input class='form-control input-sm' name='name' type='text' value='" + $(".name", $div).text() + "'></input></div>"
        + "<div class='form-group'><label>IO-Klasse</label><select class='form-control chosen-select' data-style='btn-primary' name='klasse' value='" + $(".klasse", $div).text() + "'></select></div>"
        + "<div class='form-group'><input class='form-control input-sm' name='typ' type='text' value='" + $(".typ", $div).text() + "'></input></div>"
        + "<div class='form-group'><input class='form-control input-sm' name='channel' type='text' value='" + $(".channel", $div).text() + "'></input></div>"
        + "</form>");
      $.each(klassen, function () {
        $("<option>" + this.name + "</option>").appendTo($("[name=klasse]", $form));
      });
      $div.empty();
      $form.appendTo($div);
      $("[name=klasse]").chosen({ disable_search: true});

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
            $("<li data-id=" + obj.id + "><div class='list-title'>" + obj.hostname + "</div><div class='list-subtitle'>" + obj.ip + "</div><div class='list-remark'>" + obj.remark + "</div></li>").appendTo($list);
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

