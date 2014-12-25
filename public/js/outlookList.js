(function ($) {
  $.widget("JL.outlookList", {
    options: {
    },
    _create: function () {
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      this.element.addClass("outlookList");
      this.refresh();
    },
    refresh: function () {
      var _this = this;
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
