(function () {
  "use strict";

  const App = window.App;
  const $ = App.$;

  function initMeters() {
    App.$$(".meter-fill").forEach((bar) => {
      const value = parseInt(bar.getAttribute("data-value"), 10);
      requestAnimationFrame(() => {
        bar.style.width = value + "%";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMeters();
    App.renderGauge("#service-gauge", 87, App.COLORS.green);
  });
})();
