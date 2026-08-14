(function () {
  "use strict";

  const App = window.App;
  const $ = App.$;
  const COLORS = App.COLORS;

  function pad2(x) {
    return String(x).padStart(2, "0");
  }

  function nowLabel() {
    const d = new Date();
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function initHeroCharts() {
    const labels = [];
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 2 * 60 * 1000);
      labels.push(pad2(d.getHours()) + ":" + pad2(d.getMinutes()));
    }

    const power = App.liveSeries(61, 2.7, {
      amp: 0.34,
      min: 0.35,
      max: 5.6,
      spike: 1.2,
      spikeChance: 0.07,
      freq: 0.58,
      waveAmp: 0.4,
    });
    const activity = App.liveSeries(61, 74, {
      amp: 5,
      min: 26,
      max: 96,
      spike: 9,
      spikeChance: 0.05,
      freq: 0.62,
      waveAmp: 5.5,
    });

    const powerChart = new App.CurveChart("#hero-power-chart", {
      width: 300,
      height: 96,
      pad: { top: 10, right: 6, bottom: 18, left: 36 },
      gridY: 2,
      decimals: 1,
      ariaLabel: "近两小时用电负荷曲线",
    });
    powerChart.setData([{ name: "负荷", color: COLORS.cyan, values: power }], labels);

    const activityChart = new App.CurveChart("#hero-activity-chart", {
      width: 300,
      height: 96,
      pad: { top: 10, right: 6, bottom: 18, left: 36 },
      max: 100,
      gridY: 2,
      decimals: 0,
      ariaLabel: "老人居家活跃度曲线",
    });
    activityChart.setData([{ name: "活跃度", color: COLORS.green, values: activity }], labels);

    const tickers = [
      "厨房插座长时间大功率运行，已推送至子女端",
      "深夜 01:40 检测到卧室空调异常启动，已电话确认",
      "客厅电压波动超过阈值，已生成上门检查工单",
      "漏电保护器自检通过，本周无漏电风险",
    ];
    let tickerIndex = 0;
    let alertCount = 27;
    const tickerEl = $("#hero-ticker");

    setInterval(() => {
      power.shift();
      power.push(App.walk(power[power.length - 1], 0.38, 0.35, 5.6));
      activity.shift();
      activity.push(App.walk(activity[activity.length - 1], 6, 26, 96));
      labels.shift();
      labels.push(nowLabel());

      powerChart.setData([{ name: "负荷", color: COLORS.cyan, values: power }], labels);
      activityChart.setData([{ name: "活跃度", color: COLORS.green, values: activity }], labels);

      $("#hero-power").innerHTML = App.fmt(power[power.length - 1], 2) + "<small>kW</small>";
      $("#hero-activity").innerHTML = Math.round(activity[activity.length - 1]) + "<small>%</small>";
      if (Math.random() < 0.22) {
        alertCount += 1;
        $("#hero-alerts").innerHTML = alertCount + "<small>次</small>";
      }
      if (Math.random() < 0.16) {
        tickerIndex = (tickerIndex + 1) % tickers.length;
        tickerEl.textContent = tickers[tickerIndex];
      }
    }, 2600);
  }

  function initOverview() {
    const labels = [];
    for (let i = 0; i < 144; i++) labels.push(App.timeLabel(i, 10));
    const values = App.dailyPower(144, { step: 10, noise: 0.24 });
    const threshold = values.map(() => 3.6);

    const chart = new App.CurveChart("#home-load-chart", {
      width: 780,
      height: 250,
      pad: { top: 18, right: 18, bottom: 32, left: 48 },
      gridY: 4,
      decimals: 1,
      ariaLabel: "24小时用电负荷曲线",
    });
    chart.setData(
      [
        { name: "总负荷", color: COLORS.cyan, values: values },
        { name: "安全阈值", color: COLORS.green, values: threshold, width: 1.6, fill: false },
      ],
      labels
    );

    setInterval(() => {
      const next = App.dailyPower(144, { step: 10, noise: 0.24 });
      chart.setData(
        [
          { name: "总负荷", color: COLORS.cyan, values: next },
          { name: "安全阈值", color: COLORS.green, values: threshold, width: 1.6, fill: false },
        ],
        labels
      );
    }, 5200);
  }

  function initDonutAndGauge() {
    App.renderDonut(
      "#home-donut",
      [
        { value: 9, color: COLORS.red },
        { value: 7, color: COLORS.amber },
        { value: 6, color: COLORS.violet },
        { value: 5, color: COLORS.cyan },
      ],
      "27 次",
      "今日预警"
    );

    App.renderGauge("#home-gauge", 92, COLORS.green);
    $("#home-gauge-value").textContent = "92%";
  }

  function initProfitChart() {
    const labels = [];
    for (let q = 0; q < 20; q++) labels.push("第" + (Math.floor(q / 4) + 1) + "年Q" + (q % 4 + 1));
    const densify = (values, start) => {
      const anchors = [start == null ? values[0] : start].concat(values);
      const out = [];
      for (let q = 0; q < 20; q++) {
        const seg = Math.floor(q / 4);
        const p = (q % 4 + 1) / 4;
        const a = anchors[seg];
        const b = anchors[seg + 1];
        const e = 0.5 - 0.5 * Math.cos(Math.PI * p);
        let v = a + (b - a) * e;
        if (p < 1) v += Math.sin(q * 0.9 + seg * 1.7) * (b - a) * 0.018;
        out.push(Math.round(v));
      }
      return out;
    };
    const revenue = densify([86, 158, 268, 420, 612], 42);
    const cost = densify([120, 128, 138, 152, 168], 112);
    const net = revenue.map((v, i) => v - cost[i]);

    const chart = new App.CurveChart("#home-profit-chart", {
      width: 560,
      height: 250,
      pad: { top: 18, right: 18, bottom: 30, left: 48 },
      gridY: 4,
      decimals: 0,
      ariaLabel: "年度收入增长模拟曲线",
    });
    chart.setData(
      [
        { name: "收入", color: COLORS.cyan, values: revenue },
        { name: "成本", color: COLORS.amber, values: cost, width: 1.7, fill: false },
        { name: "净收益", color: COLORS.green, values: net, width: 1.7, fill: false },
      ],
      labels
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroCharts();
    initOverview();
    initDonutAndGauge();
    initProfitChart();
  });
})();
