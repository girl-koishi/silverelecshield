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
      if (p < 1) v += Math.sin(q * 0.8 + seg * 2.1) * (b - a) * 0.02;
      out.push(Math.round(v));
    }
    return out;
  }

  function initRevenueChart() {
    const labels = [];
    for (let q = 0; q < 20; q++) labels.push("第" + (Math.floor(q / 4) + 1) + "年Q" + (q % 4 + 1));
    const chart = new App.CurveChart("#profit-revenue-chart", {
      width: 620,
      height: 260,
      pad: { top: 18, right: 18, bottom: 30, left: 48 },
      gridY: 4,
      decimals: 0,
      ariaLabel: "分业务收入增长曲线",
    });
    chart.setData(
      [
        { name: "硬件", color: COLORS.cyan, values: densify([38, 52, 68, 82, 92], 22) },
        { name: "订阅", color: COLORS.green, values: densify([22, 56, 108, 168, 238], 10) },
        { name: "服务", color: COLORS.amber, values: densify([18, 34, 62, 108, 168], 9) },
        { name: "B端", color: COLORS.violet, values: densify([8, 16, 30, 62, 114], 3) },
      ],
      labels
    );
  }

  function initDonut() {
    App.renderDonut(
      "#profit-donut",
      [
        { value: 238, color: COLORS.green },
        { value: 168, color: COLORS.amber },
        { value: 114, color: COLORS.violet },
        { value: 92, color: COLORS.cyan },
      ],
      "612 万",
      "预计年收入"
    );
  }

  function initBreakevenChart() {
    const labels = [];
    for (let q = 0; q < 20; q++) labels.push("第" + (Math.floor(q / 4) + 1) + "年Q" + (q % 4 + 1));
    const chart = new App.CurveChart("#profit-breakeven-chart", {
      width: 620,
      height: 260,
      pad: { top: 18, right: 18, bottom: 30, left: 52 },
      gridY: 4,
      decimals: 0,
      ariaLabel: "累计投入与收入曲线",
    });
    chart.setData(
      [
        { name: "累计收入", color: COLORS.cyan, values: densify([86, 244, 512, 932, 1544], 0) },
        { name: "累计投入", color: COLORS.red, values: densify([120, 248, 386, 538, 706], 0), width: 1.8, fill: false },
      ],
      labels
    );
  }

  function initMeters() {
    App.$$(".meter-fill").forEach((bar) => {
      const value = parseInt(bar.getAttribute("data-value"), 10);
      requestAnimationFrame(() => {
        bar.style.width = value + "%";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initRevenueChart();
    initDonut();
    initBreakevenChart();
    initMeters();
  });
})();
