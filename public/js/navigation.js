/* global bootbox */
/* global checkDirty */
/* global handleError */

$(function () {
  $.ajaxSetup({ cache: false });
  $('#MainNavbar').bind("contextmenu", function () {
    return false;
  });
  $('#MainLogin').bind("contextmenu", function () {
    return false;
  });

  window.checkDirty = function (cb) {
    if (($("#Workspace").attr('dirty'))) {
      bootbox.confirm("<span class='fa fa-warning' style='color:#f00;font-size:48px'></span><h3 class='inline'> Ungespeicherte Änderungen! Fortsetzen?</h3>", function (ok) {
        if (ok) { $("#Workspace").removeAttr('dirty'); }
        cb(ok);
      });
    } else {
      cb(true);
    }
  };
  window.handleError = function (err) {
    bootbox.alert("<span class='fa fa-frown-o inline-block' style='color:#f00;font-size:48px;margin-right:5px'></span><span class='inline-block'><h3 class='inline text-danger'>Fehlercode: " + err.code + "</h3><p>" + err.text + "</p></span>");
  };


  window.onbeforeunload = function () {
    if (($("#Workspace").attr('dirty'))) {
      return ("Ungespeicherte Änderungen! Seite verlassen?");
    }
  };

  // ------------------ MainNavbar -----------------------
  function MainWorkspace(url, cb) {
    checkDirty(function (ok) {
      if (ok) {
        $.get(url, function (data) {
          $('#Workspace').html(data);
          if (!$('#NavbarToggle').hasClass('collapsed')) {
            $('#NavbarToggle').click();
          }
          checkWorkspace();
          if (cb) { cb(); }
        })
        .fail(function () {
          handleError({ code: "AJAX", text: window.location.host +"/"+url+ " nicht erreichbar!" });
        });
      }
    });
  }

  function MainNavbar() {
    $.post('/check', function (data) {
      if (data.err) {
        $('#MainNav_Login').parent().removeClass('hidden');
        $('#MainNav_LogoutDD').parent().addClass('hidden');
        $('#MainNav_DokuSys').parent().addClass('hidden');
      } else {
        $('#MainNav_Login').parent().addClass('hidden');
        $('#MainNav_LogoutDD').html(data.user + "<span class='caret'></span>");
        $('#MainNav_LogoutDD').parent().removeClass('hidden');
        $('#MainNav_DokuSys').parent().removeClass('hidden');
      }
      if (!$('#MainNavbar .navbar-toggle').hasClass('collapsed')) {
        $('#MainNavbar .navbar-toggle').click();
      }

    });

  }

  function MainLogin() {
    bootbox
      .dialog({ title: 'Login', message: $('#MainLogin'), show: false })
      .on('shown.bs.modal', function () {
        $('#MainLogin').show().bootstrapValidator('resetForm', true);
        $('#MainLoginUser').focus();
      })
      .on('hide.bs.modal', function () {
        $('#MainLogin').hide().appendTo('body');
        //MainNavbar();
      })
      .on('success.form.bv', function (e) {
        e.preventDefault();
        var $form = $(e.target);
        $.post('/login', $form.serialize(), function (data) {
          if (!data.err) {
            $form.parents('.bootbox').modal('hide');
            MainNavbar();
          } else {
            $('#MainLoginErr').text("Fehler: " + data.err.text);
            //e.preventDefault();
          }
        });
      })
      .modal('show');
  }

  function MainLogout() {
    $.get('/logout', function () {
      MainNavbar();
    });
  }

  $('#MainNavbar a').click(function () { MainNav($(this).attr('id')); });
  function MainNav(id) {
    //$('#' + id).parent().addClass('active');
    switch (id) {
      case "MainNav_DokuSys":
        MainWorkspace('DokuSys', function () {
          $('#DokuSys_TopicTree')
            .on("topictree_click", function () {
              toggleWorkspace();
            });
        });
        break;
      case "MainNav_Logout":
        MainLogout();
        break;
      case "MainNav_Login":
        MainLogin();
        break;
      case "MainNav_IODevice":
        MainWorkspace('/io/devices/html', function () {
          $('#devList')
            .on("outlooklist_click", function () {
              toggleWorkspace();
            });
        });
        break;
      case "MainNav_CRUDs":
        MainWorkspace('templates/cruds/html', function () {
        });
        break;
    }

  }

  /*
  function DBErr(err) {
    bootbox.alert("<h3 class='text-danger'>" + err.code + "</h3><p>" + err.text + "</p>");
    if (err.code === "NOUSER") { MainLogout(); }
  }
  */


  // ---------------- Main ------------------

  MainNavbar();

  function checkWorkspace() {
    var height = $(window).height() - $("#MainNavbar").height() - 3;
    $(".WorkspaceLeft").height(height);
    $(".WorkspaceRight").height(height);

    if ($("#WorkspaceToggle").is(":visible")) {
      if ($(".WorkspaceLeft").is(":visible") && $(".WorkspaceRight").is(":visible")) {
        $(".WorkspaceRight").hide();
      }
    } else {
      $(".WorkspaceLeft").show();
      $(".WorkspaceRight").show();
    }
  }
  function toggleWorkspace(cb) {
    if ($("#WorkspaceToggle").is(":visible")) {
      if ($(".WorkspaceLeft").is(":visible")) {
        $(".WorkspaceLeft").hide('slide', 200, function () {
          $(".WorkspaceRight").show('slide', { direction: 'right' }, 200, function () { if (cb) { cb(); } });
        });
      } else {
        $(".WorkspaceRight").hide('slide', { direction: 'right' }, 200, function () {
          $(".WorkspaceLeft").show('slide', 200, function () { if (cb) { cb(); } });
        });
      }
    }
  }

  $(window).resize(function () {
    checkWorkspace();
  });

  checkWorkspace();


  $("#WorkspaceToggle")
    .click(function () {
      toggleWorkspace();
    });

  console.log("ready!");

  $("#btnTest").click(function () {
    $.get("/io/raw/?mood=1", function () {
    });
  });
  $("#btnTest2").click(function () {
    $.get("/io/raw/?mood=0", function () {
    });
  });


  if (0) {
    $.post('/login', { user: "jens", passwd: "mausi" }, function (data) {
      if (!data.err) {
        MainNavbar();
        $("#MainNav_CRUDs").click();
        //$("#MainNav_IODevice").click();
        //$('#MainNav_DokuSys').click();

      } else {
        $('#MainLoginErr').text("Fehler: " + data.err.text);
        //e.preventDefault();
      }
    });
  }



});