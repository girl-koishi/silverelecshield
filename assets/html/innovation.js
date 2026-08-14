(function () {
  "use strict";

  const App = window.App;
  const COLORS = App.COLORS;

  function densify(values, start) {
    const anchors = [start == null ? values[0] : start].concat(values);
    const out = [];
    for (let q = 0; q < 20; q++) {
      const seg = Math.floor(q / 4);
      const p = (q % 4 + 1) / 4;
      const a = anchors[seg];
      const b = anchors[seg + 1];
      const e = 0.5 - 0.5 * Math.cos(Math.PI * p);
      let v = a + (b - a) * e;
      if (p < 1) v += Math.sin(q * 0.85 + seg * 1.3) * (b - a) * 0.022;
      out.push(Math.round(v));
    }
    return out;
  }

  function initChart() {
    const labels = [];
    for (let q = 0; q < 20; q++) labels.push("第" + (Math.floor(q / 4) + 1) + "年Q" + (q % 4 + 1));
    const chart = new App.CurveChart("#innovation-chart", {
      width: 620,
      height: 260,
      pad: { top: 18, right: 18, bottom: 30, left: 48 },
      gridY: 4,
      decimals: 0,
      ariaLabel: "数据服务能力提升曲线",
    });
    chart.setData(
      [
        { name: "数据服务收入占比", color: COLORS.cyan, values: densify([34, 48, 62, 74, 84], 26) },
        { name: "家庭数字化覆盖率", color: COLORS.green, values: densify([12, 28, 45, 62, 78], 7), width: 1.8, fill: false },
      ],
      labels
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initChart();
  });
})();
