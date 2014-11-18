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
  $('#MainLogin button').click(function () {
    //alert($('#MainLoginUser').val());
    //$('#MainNav_Login').parent().replaceWith("<li><a href='#'>Jens</a></li>");
    $('#MainLogin form').submit();
  });
  $('#MainLogin form').on('submit', function () {
    console.log("Submit!");
    $.post('/login',{ user: $('#MainLoginUser').val() }, function(data) {
      alert(data.err)
    })
    $('#MainLogin').modal('hide');
    return false;
  });

  console.log("ready!");
});