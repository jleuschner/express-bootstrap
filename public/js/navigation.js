/* global bootbox */
$(function () {
  $.ajaxSetup({ cache: false });
  $('#MainNavbar').bind("contextmenu", function () {
    return false;
  });
  $('#MainLogin').bind("contextmenu", function () {
    return false;
  });



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

  $('#MainNavbar a').on('click', function () { MainNav($(this).attr('id')); });
  function MainNav(id) {
    //$('#' + id).parent().addClass('active');
    switch (id) {
      case "MainNav_DokuSys":
        MainWorkspace('DokuSys', function () {
          $('#DokuSys_Edit').summernote();
        });
        break;
      case "MainNav_DBtest":
        MainWorkspace('dbtest', function () {
        });
        break;
      case "MainNav_Logout":
        $.get('/logout', function () {
          $('#MainNav_Logout').parents('.dropdown').replaceWith("<li><a href='#' id='MainNav_Login'>Login</a></li>");
          $('#MainNavbar a').on('click', function () { MainNav($(this).attr('id')); });
          if (!$('#MainNavbar .navbar-toggle').hasClass('collapsed')) {
            $('#MainNavbar .navbar-toggle').click();
          }
        });
        break;
      case "MainNav_Login":
        bootbox
          .dialog({ title: 'Login', message: $('#MainLogin'), show: false })
          .on('shown.bs.modal', function () {
            $('#MainLogin').show().bootstrapValidator('resetForm', true);
            $('#MainLoginUser').focus();
          })
          .on('hide.bs.modal', function () {
            $('#MainLogin').hide().appendTo('body');
          })
          .on('success.form.bv', function (e) {
            e.preventDefault();
            var $form = $(e.target);
            $.post('/login', $form.serialize(), function (data) {
              if (!data.err) {
                $('#MainNav_Login').parent()
                  .replaceWith("<li class='dropdown'>"
                      + "<a href='#' class='dropdown-toggle' data-toggle='dropdown'>" + $('#MainLoginUser').val()
                      + "<span class='caret'></span></a>"
                      + "<ul class='dropdown-menu' role='menu'>"
                      + "<li><a href='#' id='MainNav_Logout'>Logout</a></li>"
                      + "</ul></li>");
                $('#MainNavbar a').on('click', function () { MainNav($(this).attr('id')); });
                $form.parents('.bootbox').modal('hide');
                if (!$('#MainNavbar .navbar-toggle').hasClass('collapsed')) {
                  $('#MainNavbar .navbar-toggle').click();
                }
              } else {
                $('#MainLoginErr').text("Fehler: " + data.err.text);
              }
            });
          })
          .modal('show');
        break;
    }
    
  }

  console.log("ready!");
});