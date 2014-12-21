(function ($) {

  $.widget("JL.outlookList", {
    options: {
      CollapsedIcon: "glyphicon glyphicon-plus-sign",
      CollapsedTitle: "Zweig öffnen",
      ExpandedIcon: "glyphicon glyphicon-minus-sign",
      ExpandedTitle: "Zweig schließen"
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
          _this._trigger("_click",null,this);
        });

    }
  });
} (jQuery));



$(function () {
  $("#devlist")
    .outlookList()
    .on("outlooklist_click", function(e,o){
      alert($(o).html())
    })
})

