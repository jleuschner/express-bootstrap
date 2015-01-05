console.log("SEQ-Test");
var seq = require("seq");

var actions = [{ id: 1, txt: "eins" }, { id: 2, txt: "zwei"}];
seq(actions)
  .parEach(function (action) {
    var _this = this;
    setTimeout(function () {
      console.log(action.txt);
      _this();
    }, 1000);
  })
  .seq(function () {
    console.log("fertig");
  });
