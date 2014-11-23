/* global bootbox */

(function ($) {
  // -------------- ConfigList ----------------
  $.widget("JL.configList", {
    options: {
      text: "Hallo",
      datasource: "/config/getList",
      targetForm: '#configForm',
      dberror_func: ""
    },
    _create: function () {
      var _this = this;
      var $tree = $("<div ></div>");
      $tree.appendTo(this.element);

      this._update();
      this._load($tree);
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
      //this.element.html("<h1>" + this.options.text + "</h1>");
    },
    _load: function (div) {
      var _this = this;
      $.getJSON(this.options.datasource, function (data) {
        if (data.err) {
          if (_this.options.dberror_func) {
            _this.options.dberror_func(data.err);
          }
          return;
        } else {
          var tree = $("<div class='configList'></div>");
          $.each(data.rows, function (key, obj) {
            //console.log(JSON.stringify(obj));
            var ntopic = $("<a href='#' class='list' id=topic" + obj.id + " data-json='" + JSON.stringify(obj) + "'>"
                + "<div class='list-content'> "
                + "<span class='list-title'>" + obj.hostname + "</span>"
                + "<span class='list-subtitle'>" + obj.ip + "</span>"
                + "<span class='list-remark'>" + obj.hostname + "</span>"
                + "</div></a>");
            ntopic.appendTo(tree);
          });
          div.html(tree);
          div.bind("contextmenu", function (e) {
            return false;
          });
          $('a', div).click(function () {
            $('a.marked', div).removeClass('marked');
            $(this).addClass('marked');
            $(_this.options.targetForm).configDlg('load', $(this).data('json').id);
          });
        }
      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    }
  });


  // -------------- ConfigDlg ----------------
  $.widget("JL.configDlg", {
    options: {
      id: 0,
      datasource: "/config/get",
      dberror_func: ""
    },
    _create: function () {
      var _this = this;
      if (_this.options.id) {
        this.load(_this.options.id);
      }
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      this._update();
    },
    _update: function () {
      //this.element.html("<h1>" + this.options.text + "</h1>");
    },
    load: function (id) {
      var _this = this;
      $.getJSON(_this.options.datasource, { id: id }, function (data) {
        if (data.err) {
          //console.log(data.err)
          return;
        } else {
          console.log(JSON.stringify(data.rows));
          $.each(data.fields, function (key, fieldDef) {
            $('input[name=' + fieldDef.name + ']', this.element).val(data.rows[0][fieldDef.name]);
          });
        }
      })
      .fail(function () {
        bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
      });
    }
  });

} (jQuery));
