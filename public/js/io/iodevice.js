/* global checkDirty */
/* global handleError */

(function ($) {

  $.widget("JL.netioDevice", {
    options: {
      deviceID: 0,
      datasource: "/io/device/get"
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      $("#btnDeviceEdit", this.element).click(function () {
        _this._deviceEdit(true);
      });

      $("#deviceForm", this.element).bootstrapValidator({
        fields: {
          hostname: { validators: {
            notEmpty: { message: "Hostname muss angegeben werden!" }
          }
          },
          ip: { validators: {
            ip: { message: "Gültige IP-Adresse muss angegeben werden!" }
          }
          }
        }
      })
        .on('success.form.bv', function (e) {
          e.preventDefault();
          //var $lform = $(e.target);
          //console.dir($lform.serialize());
          var formdata = new FormData(e.target);
          $.ajax({
            type: "POST",
            url: "/io/device/set",
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
            handleError({code:"AJAX", text: _this.options.datasource + " nicht erreichbar!"});
          });
        })
        .find("[name='ip']").mask('099.099.099.099');
      $("#deviceForm #btnCancel", _this.element).click(function () {
        checkDirty(function (ok) {
          if (ok) {
            if (_this.options.deviceID < 0) { _this.options.deviceID = 0; }
            _this.load(_this.options.deviceID);
          }
        });
      });

      this.load(this.options.deviceID);
    },
    _deviceEdit: function (edit) {
      var _this = this;
      if (edit) {
        $("#Workspace").attr("dirty", "sajdhakshdhk");
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
    load: function (deviceID) {
      var _this = this;
      this.options.deviceID = deviceID;
      if (deviceID === 0) {
        $("[id*=device]", this.element).hide();
        $("#about", this.element).show();
      } else {
        $("#about", this.element).hide();
        $("#deviceForm", this.element).hide();
        $("#device", this.element).show();
        if (deviceID < 0) {
          $("#device [name]", this.element).text("");
          _this._deviceEdit(true);
        } else {
          $.getJSON(this.options.datasource,{ deviceID: deviceID }, function (data) {
            if (data.err) {
              handleError(data.err);
              return;
            } else {
              console.log(JSON.stringify(data));
              $("#device [name='hostname']", this.element).text(data.rows[0].hostname);
              $("#device [name='ip']", this.element).text(data.rows[0].ip);
            }
          })
          .fail(function () {
            handleError({code:"AJAX", text: _this.options.datasource + " nicht erreichbar!"});
          });
        }
      }
    }
  });

} (jQuery));




$(function () {
  $("#devList")
    .outlookList()
    .on("outlooklist_click", function () {
      checkDirty(function (ok) {
        if (ok) {
          $("#deviceDlg").netioDevice("load", 1);
        }
      });
    });
  $("#deviceDlg").netioDevice();


  $("#btnNeu", ".WorkspaceLeft").click(function () {
    $("#deviceDlg").netioDevice("load", -1);
  });

});

