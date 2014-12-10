(function ($) {
  /*------------------- uniTree -------------------------
  * Trigger:
  *   _click({id:id} 
  *
  */
  $.widget("JL.uniTree", {
    options: {
      CollapsedIcon : "glyphicon glyphicon-plus-sign",
      CollapsedTitle : "Zweig öffnen",
      ExpandedIcon : "glyphicon glyphicon-minus-sign",
      ExpandedTitle : "Zweig schließen",
    },
    _create: function () {
      var _this = this;
      $(this.element).bind("contextmenu", function () {
        return false;
      });
      this.element.addClass("uniTree");

      var $parents = $('li:has(ul)', _this.element);
      $.each($parents.find("span:first"), function () {
        //$(this).addClass("parent_li");
        if ($(this).find(".toggle").length > 0 ) {
          $(this).find(".toggle").addClass(_this.options.CollapsedIcon).attr("title",_this.options.CollapsedTitle);
        } else {
          $("<i class='toggle "+_this.options.CollapsedIcon+"' title='"+_this.options.CollapsedTitle+"'></i>").prependTo(this);
        }
      });

      $(".toggle",$parents.find("span:first"))
        .on('click', function(e){
          var $parentLI = $(this).parentsUntil("li:has(ul)").parent();
          //console.log( $parentLI.prop("tagName") + ":"+$parentLI.html() );
          var children = $parentLI.find(" > ul > li");
          if (children.is(":visible")) {
            children.hide('fast');
            $($parentLI).find("span:first .toggle").removeClass(_this.options.ExpandedIcon).addClass(_this.options.CollapsedIcon).attr("title",_this.options.CollapsedTitle);
          } else {
            children.show('fast');
            $($parentLI).find("span:first .toggle").removeClass(_this.options.CollapsedIcon).addClass(_this.options.ExpandedIcon).attr("title",_this.options.ExpandedTitle);
          }
          e.stopPropagation();
        });

      $('li', _this.element).find("span:first").click(function (e) {
        console.log($(this).parent().data("id"));
        //_this._trigger("_click", null, { id: $(this).parent().attr('id').replace(/topic/, "") });
      });

      this.collapseAll();

    },
    collapseAll: function () {
      $('li:has(ul)', this.element).find(' > ul > li').hide();
    },
    expandAll: function () {
      $('li:has(ul)', this.element).find(' > ul > li').show();
    },


  });

} (jQuery));

