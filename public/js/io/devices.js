/* global bootbox */
/* global checkDirty */
/* global handleError */

(function ($) {
  $.widget("JL.DevicesDlg", {
    options: {
      id: 0,
      io_id: 0,
      api: "/io/devices/",
      api_types: "/io/types/",
      api_io: "/io/definitions"
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
        _this._createIO({ id: '-1', name: '', param1: '', param2: '', param3: '', param4: '' });
        _this._editIO(-1);
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
        $("#ioDefinition", this.element).hide();
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
      $("<div class='ioDef' data-id=" + io.id + "><div class='name'>" + io.name + "</div><div class='typ'>" + io.typ + "</div><div class='channel'>" + io.channel + "</div>"
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
    _loadTypes: function (cb) {
      var _this = this;
      $.getJSON(this.options.api_types, function (data) {
        if (data.err) {
          handleError(data.err);
          return;
        } else {
          $.each(data.rows, function () {
            $("<option value='" + this.id + "'>" + this.name + "</option>").appendTo($("[name='types_id']"));
          });
          $("[name='types_id']")
            .chosen({ disable_search: true })
            .on("change", function () {
              _this._changeTypes($(this).val());
            });
          if (cb) { cb(); }
        }
      })
      .fail(function () {
        handleError({ code: "AJAX", text: _this.options.api_classes + " nicht erreichbar!" });
      });
    },
    _changeTypes: function (typ) {
      var _this = this;
      $.getJSON(this.options.api_types + typ, function (data) {
        if (data.err) {
          handleError(data.err);
          return;
        } else {
          var i = 1;
          $.each(data.rows[0].params, function () {
            $("label[for='param" + i + "']").text(this);
            $("#param" + i).show(0);
            i++;
          });
          for (var j = i; j < 5; j++) {
            $("#param" + j).hide(0);
          }

        }
      })
      .fail(function () {
        handleError({ code: "AJAX", text: _this.options.api_classes + " nicht erreichbar!" });
      });
    },
    _editIO: function (id) {
      var _this = this;
      var $div = $(".ioDef[data-id='" + id + "']");
      var $form = $("<form>"
        + "<div class='form-group'><label>IO-Bezeichnung</label><input class='form-control input-sm' name='name' type='text' value='" + $(".name", $div).text() + "'></input></div>"
        + "<div class='form-group'><div class='row'>"
        + "<div class='col-xs-8'><label>IO-Typ</label><select class='form-control chosen-select' data-style='btn-primary' name='types_id' value='" + $(".typ", $div).text() + "'></select></div>"
        + "<div class='col-xs-4'><div class='btn-group pull-right'><button type='submit' class='btn btn-sm btn-success'><i class='fa fa-save'></i></button><button id='btnCancel' type='button' class='btn btn-sm btn-danger'><i class='fa fa-close'></i></button></div></div>"
        + "</div></div>"
        + "<div class='form-group'><div id='params' class='row'></div></div>"
        + "</form>");
      $div.empty();
      $form.appendTo($div);
      for (var i = 1; i < 5; i++) {
        $("<div class='col-sm-3' id='param" + i + "' hidden><label for='param" + i + "'>Param" + i + "</label><input class='form-control input-sm' name='param" + i + "' type='text'></input></div>").appendTo($("#params", $form));
      }
      this._loadTypes(function () {
        _this._changeTypes($("[name='types_id']").val());
      });

      $form.bootstrapValidator({
        fields: {
          name: { validators: {
            notEmpty: { message: "IO-Bezeichnung muss angegeben werden!" }
          }
          },
          param1: { validators: {
            notEmpty: { message: "Parameter notwendig!" }
          }
          },
          param2: { validators: {
            notEmpty: { message: "Parameter notwendig!" }
          }
          },
          param3: { validators: {
            notEmpty: { message: "Parameter notwendig!" }
          }
          },
          param4: { validators: {
            notEmpty: { message: "Parameter notwendig!" }
          }
          }
        }
      })
        .on('success.form.bv', function (e) {
          e.preventDefault();
          var post = $(e.target).serialize()+"&devices_id="+_this.options.id;
          $.ajax({
            type: (_this.options.io_id > 0) ? "PUT" : "POST",
            url: _this.options.api_io + ((_this.options.io_id > 0) ? _this.options.io_id : ""),
            data: post,
            success: function (data) {
              if (data.err) {
                handleError(data.err);
              } else {
                $("#Workspace").removeAttr("dirty");
                _this.load(data.id);
                //_this._trigger("_change", null, { err: "" });
              }
            }
          })
          .fail(function () {
            handleError({ code: "AJAX", text: _this.options.api_io + " nicht erreichbar!" });
          });
        });
      $("#btnCancel", $form).click(function () {
        checkDirty(function (ok) {
          if (ok) {
            if (_this.options.id < 0) { _this.options.id = 0; }
            _this.load(_this.options.id);
          }
        });
      });



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

