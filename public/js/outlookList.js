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
} (jQuery));
