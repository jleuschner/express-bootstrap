(function ($) {
  $.widget("JL.outlookList", {
    options: {
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      this.element.addClass("outlookList");

      $('li', this.element)
        .hover(
          function () {
            $(this).addClass('hover');
          },
          function () {
            $(this).removeClass('hover');
          })
        .click(function () {
          $('li.active').removeClass("active");
          $(this).addClass('active');
          _this._trigger("_click", null, this);
        });

    }
  });

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
      this.load(this.options.deviceID);
    },
    load: function (deviceID) {
      this.options.deviceID = deviceID;
      if (deviceID === 0) {
        $("[id*=device]", this.element).hide();
        $("#about", this.element).show();
      } else {
        $("#about", this.element).hide();
        $("#device", this.element).show();
        if (deviceID < 0) {
          $("[name='hostname']", this.element).val("Neuer Horst");
        } else {
          $.getJSON(this.options.datasource, function (data) {
            if (data.err) {
              console.log(JSON.stringify(data));
              return;
            } else {
              console.log(JSON.stringify(data));
              $("[name='hostname']", this.element).text(data.rows[0].hostname);
              $("[name='ip']", this.element).text(data.rows[0].ip);
            }
          })
          .fail(function () {
            console.log("ErrFail");
          });
        }
      }
    }
  });

} (jQuery));




$(function () {
  $("#devList")
    .outlookList()
    .on("outlooklist_click", function (e, o) {
      //alert($(o).html());
      $("#deviceDlg").netioDevice("load",1);

    })

  $("#deviceDlg").netioDevice();


  $("#btnNeu", ".WorkspaceLeft").click(function () {
    //$("<li><span class='list-title'>Neu</span></li>").appendTo("#devList");
      $("#deviceDlg").netioDevice("load",-1);
  })


  // ---------------- WorkspaceRight ---------------------------------
  $("form", ".WorkspaceRight").bootstrapValidator({
    fields: {
      hostname: { validators: {
        notEmpty: { message: "Hostname muss angegeben werden!" }
      }
      },
      ip: { validators: {
        notEmpty: { message: "IP-Adresse muss angegeben werden!" }
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
      url: _this.options.url,
      data: formdata,
      contentType: false,
      processData: false,
      success: function (data) {
        if (data.err) {
          bootbox.alert("FEHLER!");
        } else {
          _this._trigger("_finish", null, { err: "" });
        }
      }
    });
  });

})

