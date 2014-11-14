$(function () {
  $('[data-toggle="tooltip"]').tooltip()
  $('[data-toggle="popover"]').popover()

  $('.xxxnavbar .dropdown').hover(function () {
    if ($('.navbar-toggle', '#MainNavbar').hasClass('collapsed')) {
      $(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
    } 
  }, function () {
    if ($('.navbar-toggle', '#MainNavbar').hasClass('collapsed')) {
      $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp()
    }
  });


  console.log("ready!");
});