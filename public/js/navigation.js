$(function () {
  $.ajaxSetup({ cache: false });


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
      case "TopNav_DokuSys": 
        MainWorkspace('DokuSys', function(){ 
          $('#DokuSys_Edit').summernote(); 
        });
    }

  });

  console.log("ready!");
});