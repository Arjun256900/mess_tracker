document.addEventListener("onclick", () => {
  var menuCol = document.querySelector(".single_menu");
  var colorChanged = true;

  document.querySelector("#menu_button").addEventListener("click", (e) => {
    if (colorChanged) {
      // Change the background color to a transparent gradient
      menuCol.style.background =
        "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))";
      colorChanged = true;
    }
  });
});

var x = document.getElementsByClassName("single_menu");
for (var i = 0; i < x.length; i++) {
  x[i].addEventListener(
    "click",
    function () {
      var selectedEl = document.querySelector(".selected");
      if (selectedEl) {
        selectedEl.classList.remove("selected");
      }
      this.classList.add("selected");
    },
    false
  );
}

