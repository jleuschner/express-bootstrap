/* global bootbox */

$.widget("JL.topicTree", {
  options: {
    text: "Hallo",
    datasource: "/DokuSys/getList",
    dberror_func: ""
  },
  _create: function () {
    this._update();
    this.getTree();
  },
  _setOption: function (key, value) {
    this.options[key] = value;
    this._update();
  },
  _update: function () {
    this.element.html("<h1>" + this.options.text + "</h1>");
  },
  getTree: function () {
    var _this = this;
    $.getJSON(this.options.datasource, function (data) {
      if (data.err) {
        if (_this.options.dberror_func) {
          _this.options.dberror_func(data.err);
        } else {
          bootbox.alert(data.err);
        }
        return;
      }
      var items = [];
      $.each(data.rows, function (key, obj) {
        items.push("<p>" + obj.topic + "</p>");
      });
      $(items.join("")).appendTo(_this.element);
    })
    .fail(function () {
      bootbox.alert("<h4 class='text-danger'>FATAL: Datenquelle " + _this.options.datasource + " antwortet nicht!</h4>");
    });
  }
});