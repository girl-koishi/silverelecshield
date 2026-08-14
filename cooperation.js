(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const nodes = document.querySelectorAll(".network-node");
    if (!nodes.length) return;
    nodes.forEach((node, i) => {
      node.style.animationDelay = (i * 0.25).toFixed(2) + "s";
    });
  });
})();
