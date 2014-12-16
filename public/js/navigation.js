/* global bootbox */
$(function () {
  $.ajaxSetup({ cache: false });
  $('#MainNavbar').bind("contextmenu", function () {
    return false;
  });
  $('#MainLogin').bind("contextmenu", function () {
    return false;
  });

  /*
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();

  $('.xxxnavbar .dropdown').hover(function () {
  if ($('.navbar-toggle', '#MainNavbar').hasClass('collapsed')) {
  $(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
  }
  }, function () {
  if ($('.navbar-toggle', '#MainNavbar').hasClass('collapsed')) {
  $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp();
  }
  });
  */

  // ------------------ MainNavbar -----------------------
  function MainWorkspace(url, cb) {
    $.get(url, function (data) {
      $('#MainWorkspace').html(data);
      if (!$('#MainNavbar .navbar-toggle').hasClass('collapsed')) {
        $('#MainNavbar .navbar-toggle').click();
      }
      cb();
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
            .topicTree({ dberror_func: function (err) { DBErr(err); } })
            .on("topictree_click", function (e, topic) {
              $('#DokuSys_TopicDlg').topicDlg("load", topic.id);
            })
            .topicTree('load');
          $('#DokuSys_TopicDlg')
            .topicDlg({ dberror_func: function (err) { DBErr(err); } })
            .on("topicdlg_change", function (e, topic) {
              $('#DokuSys_TopicTree').topicTree("load", function () {
                $('#DokuSys_TopicTree').topicTree("selectTopic", topic.id);
              });
            })
            .on("topicdlg_crumbclick", function (e, topic) {
              $('#DokuSys_TopicTree').topicTree("selectTopic", topic.id);
            });

        });
        break;
      case "MainNav_Logout":
        MainLogout();
        break;
      case "MainNav_Login":
        MainLogin();
        break;
      case "MainNav_DBtest":
        MainWorkspace('dbtest', function () {
        });
        break;
      case "MainNav_Config":
        MainWorkspace('config', function () {
          $('#configList').configList({ dberror_func: function (err) { DBErr(err); } });
          $('#configForm').configDlg();
          $('#xconfigForm').bootstrapValidator({ fields: { ip: { validators: {
            ip: { message: 'Ip-Adresse!' }
          }
          }
          }
          });
          $('#configIP').mask('099.099.099.099', { placeholder: "___.___.___.___" });
        });
        break;
    }

  }

  function DBErr(err) {
    bootbox.alert("<h3 class='text-danger'>" + err.code + "</h3><p>" + err.text + "</p>");
    if (err.code === "NOUSER") { MainLogout(); }
  }

  // ---------------- Main ------------------

  MainNavbar();
  console.log("ready!");

  if (0) {
    $.post('/login', { user: "JensLeuschner", passwd: "mausi" }, function (data) {
    if (!data.err) {
      MainNavbar();
      $('#MainNav_DokuSys').click();

    } else {
      $('#MainLoginErr').text("Fehler: " + data.err.text);
      //e.preventDefault();
    }
    });
  }



});