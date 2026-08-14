(function () {
  "use strict";

  const App = window.App;
  const $ = App.$;
  const COLORS = App.COLORS;

  const ICONS = {
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4M12 17h.01"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0V8z"/><path d="M12 17v5"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15 8.5 9.5"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    meter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    plug2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0V8z"/><path d="M12 17v5"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20"/><path d="M6 8v4M10 8v4"/></svg>',
  };

  const FAMILIES = [
    {
      code: "张",
      name: "张爷爷家",
      city: "南京·鼓楼",
      address: "南京市鼓楼区宁海路街道",
      live: "独居",
      age: "75 岁",
      level: "重点守护",
      lastCheck: "2026-08-05",
      rcd: "已安装",
      base: 2.6,
      act: 76,
      alerts: [
        { time: "23:48", type: "night", title: "深夜异常用电", desc: "卧室空调深夜 23:48 启动并持续运行，已电话确认", level: "high", done: false },
        { time: "20:42", type: "power", title: "长时间大功率运行", desc: "厨房电饭煲连续运行 1.8 小时，功率超过阈值", level: "mid", done: false },
        { time: "18:15", type: "overload", title: "过载风险", desc: "客厅空调与厨房电器同时高功率运行", level: "mid", done: true },
        { time: "09:10", type: "leakage", title: "漏电保护自检提示", desc: "漏电保护器自检通过，建议 30 天内上门复检", level: "low", done: true },
      ],
      devices: [
        { name: "智能电表", meta: "数据质量 99%", badge: "green", badgeText: "在线", quality: 99 },
        { name: "漏电保护监测", meta: "数据质量 97%", badge: "green", badgeText: "在线", quality: 97 },
        { name: "客厅智能插座", meta: "数据质量 98%", badge: "green", badgeText: "在线", quality: 98 },
        { name: "厨房智能插座", meta: "连续运行 1.8 小时", badge: "amber", badgeText: "告警", quality: 88 },
        { name: "卧室智能插座", meta: "数据质量 99%", badge: "green", badgeText: "在线", quality: 99 },
      ],
    },
    {
      code: "李",
      name: "李奶奶家",
      city: "上海·徐汇",
      address: "上海市徐汇区漕河泾街道",
      live: "与子女同住",
      age: "68 岁",
      level: "标准守护",
      lastCheck: "2026-07-28",
      rcd: "建议安装",
      base: 1.9,
      act: 64,
      alerts: [
        { time: "16:32", type: "leakage", title: "漏电风险", desc: "浴室插座对地泄漏电流达到 32mA，超过安全阈值", level: "high", done: false },
        { time: "12:08", type: "voltage", title: "电压波动", desc: "电压短时波动至 212V，已记录并自动校准", level: "low", done: true },
        { time: "07:26", type: "night", title: "清晨异常用电", desc: "06:40 起厨房持续低频用电，判定为正常早餐时段", level: "low", done: true },
      ],
      devices: [
        { name: "智能电表", meta: "数据质量 99%", badge: "green", badgeText: "在线", quality: 99 },
        { name: "漏电保护监测", meta: "待安装", badge: "red", badgeText: "缺失", quality: 45 },
        { name: "客厅智能插座", meta: "数据质量 97%", badge: "green", badgeText: "在线", quality: 97 },
        { name: "浴室智能插座", meta: "泄漏电流偏高", badge: "amber", badgeText: "告警", quality: 72 },
      ],
    },
    {
      code: "王",
      name: "王大爷家",
      city: "杭州·西湖",
      address: "杭州市西湖区翠苑街道",
      live: "独居",
      age: "79 岁",
      level: "重点守护",
      lastCheck: "2026-08-01",
      rcd: "已安装",
      base: 3.1,
      act: 82,
      alerts: [
        { time: "19:05", type: "overload", title: "过载风险", desc: "客厅取暖器与厨房微波炉同时运行，总功率达 5.8kW", level: "high", done: false },
        { time: "17:40", type: "power", title: "长时间大功率运行", desc: "取暖器连续运行 3.2 小时，已提醒定时关闭", level: "mid", done: false },
        { time: "02:12", type: "night", title: "深夜异常用电", desc: "冰箱正常低频运行，判定无异常", level: "low", done: true },
        { time: "10:03", type: "voltage", title: "电压波动", desc: "电压波动至 234V，未超过安全范围", level: "low", done: true },
      ],
      devices: [
        { name: "智能电表", meta: "数据质量 99%", badge: "green", badgeText: "在线", quality: 99 },
        { name: "漏电保护监测", meta: "数据质量 98%", badge: "green", badgeText: "在线", quality: 98 },
        { name: "客厅智能插座", meta: "连续运行 3.2 小时", badge: "amber", badgeText: "告警", quality: 86 },
        { name: "厨房智能插座", meta: "数据质量 96%", badge: "green", badgeText: "在线", quality: 96 },
        { name: "卧室智能插座", meta: "数据质量 99%", badge: "green", badgeText: "在线", quality: 99 },
      ],
    },
  ];

  let current = FAMILIES[0];
  let currentFilter = "all";
  let powerValues = [];
  let voltageValues = [];
  let activityValues = [];
  let alertCount = 0;
  let powerChart, voltageChart, activityChart;
  const labels = [];
  for (let i = 0; i < 144; i++) labels.push(App.timeLabel(i, 10));

  function powerSeries(f) {
    return App.dailyPower(144, {
      step: 10,
      base: f.base - 1.1,
      morningPeak: 0.5,
      eveningPeak: f.base,
      noise: 0.24,
      spikeChance: 0.03,
    });
  }

  function voltageSeries() {
    const out = [];
    let v = 227;
    for (let i = 0; i < 144; i++) {
      v += Math.sin(i * 0.24 + 0.7) * 1.7 + Math.sin(i * 0.63 + 2.3) * 0.9;
      v = App.walk(v, 1.2, 217, 236);
      out.push(Number(v.toFixed(1)));
    }
    return out;
  }

  function currentSeries(power) {
    return power.map((p) => Math.max(2.5, (p * 1000) / 226));
  }

  function activitySeries(f) {
    const out = [];
    for (let i = 0; i < 144; i++) {
      const h = (i * 10) / 60;
      let base = 34;
      base += 18 * Math.exp(-Math.pow(h - 9, 2) / 3);
      base += 22 * Math.exp(-Math.pow(h - 13, 2) / 5);
      base += 24 * Math.exp(-Math.pow(h - 19, 2) / 3);
      base += Math.sin(i * 0.16 + 1.2) * 5 + Math.sin(i * 0.43 + 0.4) * 3;
      if (h >= 23 || h < 6) base = 26;
      const v = Math.min(97, Math.max(20, base + App.rnd(-5, 5) + (f.act - 70) * 0.28));
      out.push(Math.round(v));
    }
    return out;
  }

  function renderChips() {
    const wrap = $("#family-chips");
    wrap.innerHTML = FAMILIES.map(
      (f, idx) =>
        '<button class="family-chip' +
        (f === current ? " active" : "") +
        '" data-idx="' +
        idx +
        '"><span class="chip-avatar">' +
        f.code +
        '</span><span class="chip-meta"><strong>' +
        f.name +
        "</strong>" +
        f.city +
        "</span></button>"
    ).join("");
    App.$$(".family-chip", wrap).forEach((chip) => {
      chip.addEventListener("click", () => {
        current = FAMILIES[parseInt(chip.getAttribute("data-idx"), 10)];
        selectFamily();
      });
    });
  }

  function renderAlerts() {
    const list = current.alerts.filter((a) => currentFilter === "all" || a.type === currentFilter);
    const el = $("#alert-list");
    if (!list.length) {
      el.innerHTML = '<div class="status-item"><span class="status-name">当前筛选下暂无预警</span><span class="badge badge-green">一切正常</span></div>';
      return;
    }
    el.innerHTML = list
      .map((a) => {
        const sev = a.level === "high" ? "sev-high" : a.level === "mid" ? "sev-mid" : "sev-low";
        const badge = a.level === "high" ? '<span class="badge badge-red">高危</span>' : a.level === "mid" ? '<span class="badge badge-amber">关注</span>' : '<span class="badge badge-cyan">提示</span>';
        const icon = a.type === "night" ? ICONS.moon : a.type === "leakage" ? ICONS.alert : a.type === "power" ? ICONS.plug : a.type === "voltage" ? ICONS.gauge : ICONS.zap;
        const action = a.done
          ? '<span class="badge badge-green">已处理</span>'
          : '<a class="btn btn-sm btn-ghost alert-action" href="services.html">生成工单</a>';
        return (
          '<div class="alert-item ' +
          sev +
          '" data-type="' +
          a.type +
          '"><span class="alert-ic">' +
          icon +
          '</span><div class="alert-body"><div class="alert-top"><strong>' +
          a.title +
          "</strong>" +
          badge +
          '<span class="alert-time">' +
          a.time +
          '</span></div><div class="alert-desc">' +
          a.desc +
          "</div></div>" +
          action +
          "</div>"
        );
      })
      .join("");
  }

  function renderDevices() {
    const el = $("#device-list");
    el.innerHTML = current.devices
      .map((d) => {
        const icon = d.name.indexOf("插座") > -1 ? ICONS.plug2 : d.name.indexOf("漏电") > -1 ? ICONS.shield : ICONS.meter;
        const badgeCls = d.badge === "green" ? "badge-green" : d.badge === "amber" ? "badge-amber" : "badge-red";
        return (
          '<div class="status-item"><span class="status-ic">' +
          icon +
          '</span><div style="flex:1;min-width:0"><div class="status-name">' +
          d.name +
          '</div><div class="status-meta">' +
          d.meta +
          '</div><div class="progress-track"><div class="progress-fill" data-w="' +
          d.quality +
          '"></div></div></div><span class="badge ' +
          badgeCls +
          '">' +
          d.badgeText +
          "</span></div>"
        );
      })
      .join("");
    App.$$(".progress-fill", el).forEach((bar) => {
      requestAnimationFrame(() => (bar.style.width = bar.getAttribute("data-w") + "%"));
    });
  }

  function renderProfile() {
    const el = $("#family-profile");
    el.innerHTML =
      '<div class="status-list" style="margin-top:12px">' +
      '<div class="status-item"><span class="status-name">居住状态</span><span class="status-meta"><strong>' +
      current.live +
      "</strong> · " +
      current.age +
      "</span></div>" +
      '<div class="status-item"><span class="status-name">家庭地址</span><span class="status-meta">' +
      current.address +
      "</span></div>" +
      '<div class="status-item"><span class="status-name">服务等级</span><span class="badge badge-amber">' +
      current.level +
      "</span></div>" +
      '<div class="status-item"><span class="status-name">最近体检</span><span class="status-meta">' +
      current.lastCheck +
      "</span></div>" +
      '<div class="status-item"><span class="status-name">漏电保护</span><span class="badge ' +
      (current.rcd === "已安装" ? "badge-green" : "badge-red") +
      '">' +
      current.rcd +
      "</span></div></div>";
  }

  function renderTicket() {
    const pending = current.alerts.filter((a) => !a.done);
    const high = pending.filter((a) => a.level === "high").length;
    $("#ticket-title").textContent = pending.length ? "检测到 " + pending.length + " 项待处理风险" : "当前无待处理风险";
    $("#ticket-desc").textContent = high
      ? "其中高危 " + high + " 项，建议尽快预约上门用电安全检查并完成整改。"
      : "建议按周期预约上门检查，持续保持家庭用电安全。";
  }

  function renderDonut() {
    const counts = { overload: 0, night: 0, power: 0, voltage: 0 };
    current.alerts.forEach((a) => {
      if (counts[a.type] != null) counts[a.type] += 1;
    });
    const total = counts.overload + counts.night + counts.power + counts.voltage || 1;
    App.renderDonut(
      "#monitor-donut",
      [
        { value: counts.overload, color: COLORS.red },
        { value: counts.night, color: COLORS.amber },
        { value: counts.power, color: COLORS.violet },
        { value: counts.voltage, color: COLORS.cyan },
      ],
      total + " 次",
      "今日预警"
    );
    $("#donut-overload").textContent = counts.overload + " 次";
    $("#donut-night").textContent = counts.night + " 次";
    $("#donut-power").textContent = counts.power + " 次";
    $("#donut-voltage").textContent = counts.voltage + " 次";
  }

  function updateStats() {
    const p = powerValues[powerValues.length - 1];
    const v = voltageValues[voltageValues.length - 1];
    const c = currentSeries([p])[0];
    const a = activityValues[activityValues.length - 1];
    $("#stat-power").innerHTML = App.fmt(p, 2) + "<small>kW</small>";
    $("#stat-power-trend").textContent = p > 4.2 ? "高于安全阈值，请关注" : "处于正常用电区间";
    $("#stat-voltage").innerHTML = App.fmt(v, 1) + "<small>V</small>";
    $("#stat-current").textContent = "电流 " + App.fmt(c, 1) + " A";
    $("#stat-activity").innerHTML = Math.round(a) + "<small>%</small>";
    $("#stat-activity-trend").textContent = a > 70 ? "客厅活动较为频繁" : "当前活动较少，建议电话问候";
    $("#stat-alerts").innerHTML = alertCount + "<small>次</small>";
    $("#stat-alerts-trend").textContent = current.alerts.filter((x) => x.level === "high" && !x.done).length + " 项高危待处理";
  }

  function initCharts() {
    powerChart = new App.CurveChart("#monitor-power-chart", {
      width: 760,
      height: 240,
      pad: { top: 18, right: 18, bottom: 32, left: 48 },
      gridY: 4,
      decimals: 1,
      ariaLabel: "今日用电负荷曲线",
    });
    voltageChart = new App.CurveChart("#monitor-voltage-chart", {
      width: 620,
      height: 220,
      pad: { top: 18, right: 44, bottom: 30, left: 44 },
      gridY: 3,
      decimals: 1,
      ariaLabel: "电压与电流曲线",
    });
    activityChart = new App.CurveChart("#monitor-activity-chart", {
      width: 620,
      height: 190,
      pad: { top: 14, right: 14, bottom: 26, left: 42 },
      max: 100,
      gridY: 4,
      decimals: 0,
      ariaLabel: "老人居家活跃度曲线",
    });
  }

  function drawCharts() {
    const threshold = powerValues.map(() => Math.min(5.6, current.base + 1.6));
    powerChart.setData(
      [
        { name: "总功率", color: COLORS.cyan, values: powerValues },
        { name: "预警阈值", color: COLORS.amber, values: threshold, width: 1.6, fill: false },
      ],
      labels
    );
    voltageChart.setData(
      [{ name: "电压", color: COLORS.cyan, values: voltageValues }],
      labels,
      [{ name: "电流", color: COLORS.violet, values: currentSeries(powerValues) }]
    );
    activityChart.setData([{ name: "活跃度", color: COLORS.green, values: activityValues }], labels);
  }

  function selectFamily() {
    powerValues = powerSeries(current);
    voltageValues = voltageSeries();
    activityValues = activitySeries(current);
    alertCount = current.alerts.length;
    renderChips();
    renderAlerts();
    renderDevices();
    renderProfile();
    renderTicket();
    renderDonut();
    drawCharts();
    updateStats();
  }

  function initFilters() {
    App.$$("#alert-filters .filter-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        App.$$("#alert-filters .filter-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        renderAlerts();
      });
    });
  }

  function startLive() {
    setInterval(() => {
      const last = powerValues.length - 1;
      let p = App.walk(powerValues[last], 0.22, 0.35, current.base + 2.8);
      if (Math.random() < 0.06) p = Math.min(6.2, p + App.rnd(0.6, 1.5));
      powerValues[last] = p;
      voltageValues[last] = App.walk(voltageValues[last], 2, 217, 236);
      activityValues[last] = Math.round(App.walk(activityValues[last], 4, 22, 96));

      drawCharts();
      updateStats();

      if (Math.random() < 0.12) {
        const now = new Date();
        const types = ["overload", "leakage", "night", "power"];
        const type = types[Math.floor(Math.random() * types.length)];
        const titles = {
          overload: "过载风险",
          leakage: "漏电风险",
          night: "深夜异常用电",
          power: "长时间大功率运行",
        };
        current.alerts.unshift({
          time: String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"),
          type: type,
          title: titles[type],
          desc: "平台实时分析新增预警，建议查看详情并预约上门检查。",
          level: Math.random() < 0.4 ? "high" : "mid",
          done: false,
        });
        alertCount += 1;
        renderAlerts();
        renderTicket();
        renderDonut();
      }
    }, 2600);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    initFilters();
    selectFamily();
    startLive();
  });
})();
