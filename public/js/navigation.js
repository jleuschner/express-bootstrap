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

  $('#MainNavbar a').on('click', function () {
    switch ($(this).attr('id')) {
      case "MainNav_DokuSys":
        MainWorkspace('DokuSys', function () {
          $('#DokuSys_Edit').summernote();
        });
        break;
      case "MainNav_Login":
        $('#MainLogin').modal();
        break;
    }
  });

  // ------------------ MainLogin -----------------------
  $('#MainLogin').on('shown.bs.modal', function () {
    $('#MainLoginErr').text("");
    $('#MainLoginUser').focus();
  });
  $('#MainLogin button').click(function () {
    $('#MainLogin form').submit();
  });
  $('#MainLogin form').on('submit', function () {
    $('#MainLogin input').each(function () {
      console.log($(this).val().length);
      if ($(this).val().length < 1) {
        $(this).focus();
        $('#MainLoginErr').text("Username/Passwort erforderlich");
        return false;
      }
    });
    $.post('/login', { user: $('#MainLoginUser').val() }, function (data) {
      if (!data.err) {
        $('#MainLogin').modal('hide');
        $('#MainNav_Login').parent()
          .replaceWith("<li class='dropdown'>"
              + "<a href='#' class='dropdown-toggle' data-toggle='dropdown'>" + $('#MainLoginUser').val()
              + "<span class='caret'></span></a>"
              + "<ul class='dropdown-menu' role='menu'>"
              + "<li><a href='#'>Logout</a></li>"
              + "</ul></li>");
      } else {
        $('#MainLoginErr').text("Fehler: " + data.err);
      }
    });
    return false;
  });

  console.log("ready!");
});