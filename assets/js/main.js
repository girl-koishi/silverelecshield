(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const COLORS = {
    cyan: "#3fe0ff",
    cyanSoft: "#8ceeff",
    green: "#46e0a4",
    amber: "#ffc26b",
    orange: "#ff9b5c",
    red: "#ff5c7a",
    violet: "#9d8cff",
    muted: "#94a8b5",
  };

  function rnd(min, max) {
    return Math.random() * (max - min) + min;
  }

  function walk(value, amp, min, max) {
    const next = value + (Math.random() - 0.5) * amp;
    return Math.max(min, Math.min(max, next));
  }

  function fmt(value, digits) {
    const d = digits == null ? 1 : digits;
    return Number(value).toFixed(d);
  }

  function timeLabel(i, stepMinutes) {
    const step = stepMinutes || 30;
    const total = i * step;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function shade(hex, amt) {
    const num = parseInt(hex.replace("#", ""), 16);
    const mix = (c) => Math.min(255, Math.round(c + (255 - c) * amt));
    const r = mix((num >> 16) & 255);
    const g = mix((num >> 8) & 255);
    const b = mix(num & 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function dailyPower(n, opts) {
    const o = opts || {};
    const step = o.step || 30;
    const out = [];
    for (let i = 0; i < n; i++) {
      const h = (i * step) / 60;
      let base =
        (o.base || 1.4) +
        (o.morningPeak || 0.62) * Math.exp(-Math.pow(h - 8.4, 2) / 2.6) +
        (o.lunchPeak || 0.38) * Math.exp(-Math.pow(h - 12.6, 2) / 3.4) +
        (o.eveningPeak || 1.75) * Math.exp(-Math.pow(h - 20.4, 2) / 2.1);
      base += Math.sin(h * 1.37 + 0.6) * 0.2;
      base += Math.sin(h * 0.63 + 2.1) * 0.15;
      base += Math.sin(h * 2.91 + 1.1) * 0.08;
      if (h >= 23 || h < 6) {
        base = 0.42 + Math.sin(h * 2.2 + 0.4) * 0.09;
      }
      const noise = rnd(-1, 1) * (o.noise || 0.26);
      let v = Math.max(0.1, base + noise);
      if (o.spikeChance && Math.random() < o.spikeChance) {
        v += rnd(0.3, 0.9);
      }
      out.push(Number(v.toFixed(2)));
    }
    return out;
  }

  function liveSeries(n, start, opts) {
    const o = opts || {};
    const out = [];
    let v = start;
    const min = o.min == null ? 0 : o.min;
    const max = o.max == null ? 8 : o.max;
    for (let i = 0; i < n; i++) {
      v = walk(v, o.amp || 0.34, min, max);
      v += Math.sin(i * (o.freq || 0.34) + (o.phase || 0)) * (o.waveAmp || 0.22);
      v += Math.sin(i * 0.11 + 1.7) * 0.13;
      if (o.spike && Math.random() < (o.spikeChance || 0.05)) {
        v += o.spike;
      }
      v = Math.max(min, Math.min(max, v));
      out.push(Number(v.toFixed(2)));
    }
    return out;
  }

  class CurveChart {
    constructor(el, opts) {
      this.el = typeof el === "string" ? document.querySelector(el) : el;
      if (!this.el) return;
      this.opts = opts || {};
      this.ns = "http://www.w3.org/2000/svg";
      this.width = this.opts.width || 680;
      this.height = this.opts.height || 230;
      this.pad = Object.assign({ top: 18, right: 18, bottom: 30, left: 46 }, this.opts.pad || {});
      this.series = [];
      this.rightSeries = [];
      this.labels = [];
      this.nodes = [];
      this.gradId = 0;
      this.built = false;
      this.raf = 0;
      this.build();
    }

    build() {
      this.el.innerHTML = "";
      const svg = document.createElementNS(this.ns, "svg");
      svg.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", this.opts.ariaLabel || "数据曲线图");
      this.svg = svg;

      this.defs = document.createElementNS(this.ns, "defs");
      this.gridG = this.makeGroup("grid-layer");
      this.lineG = this.makeGroup("line-layer");
      this.axisG = this.makeGroup("axis-layer");
      this.tipG = this.makeGroup("tip-layer");
      svg.appendChild(this.defs);
      svg.appendChild(this.gridG);
      svg.appendChild(this.lineG);
      svg.appendChild(this.axisG);
      svg.appendChild(this.tipG);

      const overlay = document.createElementNS(this.ns, "rect");
      overlay.setAttribute("x", this.pad.left);
      overlay.setAttribute("y", 0);
      overlay.setAttribute("width", Math.max(10, this.width - this.pad.left - this.pad.right));
      overlay.setAttribute("height", this.height);
      overlay.setAttribute("fill", "transparent");
      overlay.style.cursor = "crosshair";
      this.overlay = overlay;
      svg.appendChild(overlay);

      this.tip = document.createElement("div");
      this.tip.className = "chart-tip";
      this.el.appendChild(this.tip);

      overlay.addEventListener("mousemove", (e) => this.hover(e));
      overlay.addEventListener("mouseleave", () => this.hideTip());
      overlay.addEventListener("touchstart", (e) => this.touchHover(e), { passive: true });
      this.el.appendChild(svg);
    }

    makeGroup(cls) {
      const g = document.createElementNS(this.ns, "g");
      g.setAttribute("class", cls);
      return g;
    }

    setData(series, labels, rightSeries) {
      this.targetSeries = (series || []).map((s) => Object.assign({}, s, { values: s.values.slice() }));
      this.targetRight = (rightSeries || []).map((s) => Object.assign({}, s, { values: s.values.slice() }));
      this.labels = labels || [];
      if (!this.built) {
        this.series = this.targetSeries.map((s) => Object.assign({}, s, { values: s.values.slice() }));
        this.rightSeries = this.targetRight.map((s) => Object.assign({}, s, { values: s.values.slice() }));
        this.rebuild();
        this.built = true;
        this.animateIn();
      } else {
        this.rebuildAxes();
        this.tween();
      }
    }

    innerW() {
      return this.width - this.pad.left - this.pad.right;
    }

    innerH() {
      return this.height - this.pad.top - this.pad.bottom;
    }

    yMax() {
      if (this.opts.max && this.opts.max !== "auto") return this.opts.max;
      const src = this.targetSeries && this.targetSeries.length ? this.targetSeries : this.series;
      let m = 1;
      src.forEach((s) => {
        if (s.values) m = Math.max(m, Math.max.apply(null, s.values));
      });
      const srcRight = this.targetRight && this.targetRight.length ? this.targetRight : this.rightSeries;
      if (srcRight.length) {
        srcRight.forEach((s) => {
          if (s.values) m = Math.max(m, Math.max.apply(null, s.values));
        });
      }
      return m * 1.15;
    }

    yMin() {
      const src = this.targetSeries && this.targetSeries.length ? this.targetSeries : this.series;
      let m = 0;
      src.forEach((s) => {
        if (s.values && s.values.length) m = Math.min(m, Math.min.apply(null, s.values));
      });
      return m < 0 ? m * 1.15 : 0;
    }

    rightYMax() {
      const src = this.targetRight && this.targetRight.length ? this.targetRight : this.rightSeries;
      let m = 1;
      src.forEach((s) => {
        if (s.values) m = Math.max(m, Math.max.apply(null, s.values));
      });
      return m * 1.15;
    }

    xAt(i) {
      const n = Math.max(1, (this.series[0] && this.series[0].values.length - 1) || 1);
      return this.pad.left + (i / n) * this.innerW();
    }

    yAt(v, max, min) {
      const mn = min == null ? 0 : min;
      return this.pad.top + (1 - (v - mn) / (max - mn)) * this.innerH();
    }

    rebuild() {
      this.gridG.innerHTML = "";
      this.lineG.innerHTML = "";
      this.axisG.innerHTML = "";
      this.tipG.innerHTML = "";
      this.nodes = [];
      this.hideTip();

      this.drawAxes();

      const allSeries = this.targetSeries.concat(
        this.targetRight.map((s) => Object.assign({}, s, { right: true }))
      );
      allSeries.forEach((s) => {
        const color = s.color || COLORS.cyan;
        const node = {};
        const group = this.makeGroup("curve-series");

        const gradId = "cg" + this.gradId++;
        const grad = document.createElementNS(this.ns, "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "0");
        grad.setAttribute("y1", "0");
        grad.setAttribute("x2", "1");
        grad.setAttribute("y2", "0");
        [[0, shade(color, 0.22)], [0.46, shade(color, 0.04)], [0.68, color], [1, shade(color, 0.26)]].forEach(
          (st) => {
            const stop = document.createElementNS(this.ns, "stop");
            stop.setAttribute("offset", st[0]);
            stop.setAttribute("stop-color", st[1]);
            grad.appendChild(stop);
          }
        );
        this.defs.appendChild(grad);

        if (s.fill !== false) {
          const area = document.createElementNS(this.ns, "path");
          area.setAttribute("fill", color);
          area.setAttribute("fill-opacity", "0.09");
          group.appendChild(area);
          node.area = area;
        }

        const glow1 = document.createElementNS(this.ns, "path");
        glow1.setAttribute("fill", "none");
        glow1.setAttribute("stroke", color);
        glow1.setAttribute("stroke-width", (s.width || 2.2) + 7);
        glow1.setAttribute("stroke-linecap", "round");
        glow1.setAttribute("stroke-linejoin", "round");
        glow1.setAttribute("opacity", "0.1");
        group.appendChild(glow1);
        node.glow1 = glow1;

        const glow2 = document.createElementNS(this.ns, "path");
        glow2.setAttribute("fill", "none");
        glow2.setAttribute("stroke", color);
        glow2.setAttribute("stroke-width", (s.width || 2.2) + 3);
        glow2.setAttribute("stroke-linecap", "round");
        glow2.setAttribute("stroke-linejoin", "round");
        glow2.setAttribute("opacity", "0.2");
        group.appendChild(glow2);
        node.glow2 = glow2;

        const line = document.createElementNS(this.ns, "path");
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "url(#" + gradId + ")");
        line.setAttribute("stroke-width", s.width || 2.2);
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke-linejoin", "round");
        group.appendChild(line);
        node.line = line;

        const flow = document.createElementNS(this.ns, "path");
        flow.setAttribute("fill", "none");
        flow.setAttribute("stroke", shade(color, 0.5));
        flow.setAttribute("stroke-width", "1.2");
        flow.setAttribute("stroke-linecap", "round");
        flow.setAttribute("stroke-linejoin", "round");
        flow.setAttribute("stroke-dasharray", "5 12");
        flow.setAttribute("opacity", "0.75");
        flow.style.animation = "curve-flow 1.5s linear infinite";
        group.appendChild(flow);
        node.flow = flow;

        const dot = document.createElementNS(this.ns, "circle");
        dot.setAttribute("r", "3.5");
        dot.setAttribute("fill", "#0a0e13");
        dot.setAttribute("stroke", color);
        dot.setAttribute("stroke-width", "2.2");
        group.appendChild(dot);
        node.dot = dot;

        const pulse = document.createElementNS(this.ns, "circle");
        pulse.setAttribute("r", "5");
        pulse.setAttribute("fill", "none");
        pulse.setAttribute("stroke", color);
        pulse.setAttribute("stroke-width", "1.4");
        pulse.setAttribute("opacity", "0.7");
        pulse.style.transformOrigin = "center";
        pulse.style.animation = "pulse-soft 1.8s ease-in-out infinite";
        group.appendChild(pulse);
        node.pulse = pulse;

        this.lineG.appendChild(group);
        this.nodes.push(node);
      });

      this.paint();
    }

    rebuildAxes() {
      this.gridG.innerHTML = "";
      this.axisG.innerHTML = "";
      this.drawAxes();
    }

    drawAxes() {
      const src = this.targetSeries && this.targetSeries.length ? this.targetSeries : this.series;
      if (!src.length) return;
      const ymax = this.yMax();
      const ymin = this.yMin();
      const rmax = this.rightYMax();
      const gridN = this.opts.gridY || 4;
      const decimals = this.opts.decimals == null ? 1 : this.opts.decimals;

      for (let i = 0; i <= gridN; i++) {
        const y = this.pad.top + (this.innerH() * i) / gridN;
        const v = ymin + (ymax - ymin) * (1 - i / gridN);
        const line = document.createElementNS(this.ns, "line");
        line.setAttribute("x1", this.pad.left);
        line.setAttribute("y1", y);
        line.setAttribute("x2", this.width - this.pad.right);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(139,190,214,0.14)");
        line.setAttribute("stroke-width", "1");
        this.gridG.appendChild(line);

        const txt = document.createElementNS(this.ns, "text");
        txt.setAttribute("x", this.pad.left - 8);
        txt.setAttribute("y", y + 4);
        txt.setAttribute("text-anchor", "end");
        txt.setAttribute("fill", "#6d818e");
        txt.setAttribute("font-size", "10.5");
        txt.textContent = this.opts.yFormat ? this.opts.yFormat(v) : fmt(v, decimals);
        this.axisG.appendChild(txt);

        if (this.rightSeries.length) {
          const rv = rmax * (1 - i / gridN);
          const rt = document.createElementNS(this.ns, "text");
          rt.setAttribute("x", this.width - this.pad.right + 8);
          rt.setAttribute("y", y + 4);
          rt.setAttribute("text-anchor", "start");
          rt.setAttribute("fill", "#6d818e");
          rt.setAttribute("font-size", "10.5");
          rt.textContent = this.opts.yFormat ? this.opts.yFormat(rv) : fmt(rv, decimals);
          this.axisG.appendChild(rt);
        }
      }

      const n = src[0].values.length;
      const labelEvery = Math.max(1, Math.round(n / 7));
      const labelIdx = [];
      for (let i = 0; i < n; i += labelEvery) labelIdx.push(i);
      const lastDrawn = labelIdx[labelIdx.length - 1];
      const pxPerStep = this.innerW() / Math.max(1, n - 1);
      if (n - 1 > lastDrawn && (n - 1 - lastDrawn) * pxPerStep >= 38) labelIdx.push(n - 1);
      labelIdx.forEach((i) => {
        const label = this.labels[i];
        if (label == null) return;
        const x = this.xAt(i);

        const vline = document.createElementNS(this.ns, "line");
        vline.setAttribute("x1", x);
        vline.setAttribute("y1", this.pad.top);
        vline.setAttribute("x2", x);
        vline.setAttribute("y2", this.pad.top + this.innerH());
        vline.setAttribute("stroke", "rgba(139,190,214,0.05)");
        vline.setAttribute("stroke-width", "1");
        this.gridG.appendChild(vline);

        const txt = document.createElementNS(this.ns, "text");
        const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
        const tx = i === 0 ? this.pad.left + 2 : i === n - 1 ? this.width - this.pad.right - 2 : x;
        txt.setAttribute("x", tx);
        txt.setAttribute("y", this.height - 8);
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("fill", "#6d818e");
        txt.setAttribute("font-size", "10.5");
        txt.textContent = label;
        this.axisG.appendChild(txt);
      });
    }

    paint() {
      if (!this.nodes.length) return;
      const ymax = this.yMax();
      const ymin = this.yMin();
      const rmax = this.rightYMax();
      let idx = 0;
      this.series.forEach((s) => {
        this.paintSeries(s, ymax, ymin, this.nodes[idx++]);
      });
      this.rightSeries.forEach((s) => {
        this.paintSeries(s, rmax, 0, this.nodes[idx++]);
      });
    }

    paintSeries(s, max, min, node) {
      if (!s.values || !s.values.length || !node) return;
      const pts = s.values.map((v, i) => [this.xAt(i), this.yAt(v, max, min)]);
      const d = this.smoothPath(pts);
      node.line.setAttribute("d", d);
      node.glow1.setAttribute("d", d);
      node.glow2.setAttribute("d", d);
      node.flow.setAttribute("d", d);

      if (node.area) {
        const baseline = this.yAt(Math.max(0, min), max, min);
        const areaD =
          "M " +
          this.pad.left +
          " " +
          baseline +
          " L " +
          pts.map((p) => p[0] + " " + p[1]).join(" L ") +
          " L " +
          pts[pts.length - 1][0] +
          " " +
          baseline +
          " Z";
        node.area.setAttribute("d", areaD);
      }

      const last = pts[pts.length - 1];
      node.dot.setAttribute("cx", last[0]);
      node.dot.setAttribute("cy", last[1]);
      node.pulse.setAttribute("cx", last[0]);
      node.pulse.setAttribute("cy", last[1]);
    }

    animateIn() {
      this.nodes.forEach((node, si) => {
        [node.line, node.flow].forEach((p) => {
          p.style.opacity = "0";
        });
        requestAnimationFrame(() => {
          [node.line, node.flow].forEach((p) => {
            p.style.transition = "opacity 0.9s ease " + si * 0.12 + "s";
            p.style.opacity = "1";
          });
        });
      });
    }

    tween() {
      if (this.raf) cancelAnimationFrame(this.raf);
      const fromS = this.series.map((s) => s.values.slice());
      const fromR = this.rightSeries.map((s) => s.values.slice());
      const toS = this.targetSeries.map((s) => s.values.slice());
      const toR = this.targetRight.map((s) => s.values.slice());
      const reduce =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 0 : this.opts.smoothMs == null ? 900 : this.opts.smoothMs;
      const start = performance.now();

      const step = (now) => {
        const p = dur ? Math.min(1, (now - start) / dur) : 1;
        const e = 1 - Math.pow(1 - p, 3);
        this.series.forEach((s, si) => {
          const f = fromS[si];
          const t = toS[si];
          if (!f || !t || f.length !== t.length) return;
          s.values = f.map((v, i) => v + (t[i] - v) * e);
        });
        this.rightSeries.forEach((s, si) => {
          const f = fromR[si];
          const t = toR[si];
          if (!f || !t || f.length !== t.length) return;
          s.values = f.map((v, i) => v + (t[i] - v) * e);
        });
        this.paint();
        if (p < 1) {
          this.raf = requestAnimationFrame(step);
        } else {
          this.series.forEach((s, si) => (s.values = toS[si]));
          this.rightSeries.forEach((s, si) => (s.values = toR[si]));
          this.paint();
          this.raf = 0;
        }
      };

      this.raf = requestAnimationFrame(step);
    }

    smoothPath(pts) {
      if (pts.length < 2) return "";
      let d = "M " + pts[0][0] + " " + pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += " C " + c1x + " " + c1y + " " + c2x + " " + c2y + " " + p2[0] + " " + p2[1];
      }
      return d;
    }

    indexFromX(px) {
      let best = 0;
      let bestDist = Infinity;
      const n = this.series[0].values.length;
      for (let i = 0; i < n; i++) {
        const d = Math.abs(this.xAt(i) - px);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    }

    hover(e) {
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width) return;
      const px = (e.clientX - rect.left) * (this.width / rect.width);
      const i = this.indexFromX(px);
      this.showTip(i, e.clientX, e.clientY);
    }

    touchHover(e) {
      const t = e.touches[0];
      const rect = this.svg.getBoundingClientRect();
      const px = (t.clientX - rect.left) * (this.width / rect.width);
      const i = this.indexFromX(px);
      this.showTip(i, t.clientX, t.clientY);
    }

    showTip(i, clientX, clientY) {
      const rect = this.el.getBoundingClientRect();
      const x = this.xAt(i);
      const ymax = this.yMax();
      const ymin = this.yMin();
      const rmax = this.rightYMax();
      this.tipG.innerHTML = "";

      const line = document.createElementNS(this.ns, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", this.pad.top);
      line.setAttribute("x2", x);
      line.setAttribute("y2", this.pad.top + this.innerH());
      line.setAttribute("stroke", "rgba(63,224,255,0.4)");
      line.setAttribute("stroke-dasharray", "3 3");
      this.tipG.appendChild(line);

      let html = "<div>" + (this.labels[i] || "") + "</div>";
      this.series.forEach((s) => {
        const dotX = this.xAt(i);
        const dotY = this.yAt(s.values[i], ymax, ymin);
        const c = document.createElementNS(this.ns, "circle");
        c.setAttribute("cx", dotX);
        c.setAttribute("cy", dotY);
        c.setAttribute("r", "3");
        c.setAttribute("fill", s.color);
        this.tipG.appendChild(c);
        html += "<div><span style='color:" + s.color + "'>●</span> " + s.name + " <strong>" + fmt(s.values[i], this.opts.decimals == null ? 1 : this.opts.decimals) + "</strong></div>";
      });
      this.rightSeries.forEach((s) => {
        const dotX = this.xAt(i);
        const dotY = this.yAt(s.values[i], rmax, 0);
        const c = document.createElementNS(this.ns, "circle");
        c.setAttribute("cx", dotX);
        c.setAttribute("cy", dotY);
        c.setAttribute("r", "3");
        c.setAttribute("fill", s.color);
        this.tipG.appendChild(c);
        html += "<div><span style='color:" + s.color + "'>●</span> " + s.name + " <strong>" + fmt(s.values[i], this.opts.decimals == null ? 1 : this.opts.decimals) + "</strong></div>";
      });

      this.tip.innerHTML = html;
      this.tip.style.opacity = "1";
      const tipRect = this.tip.getBoundingClientRect();
      let left = clientX - rect.left;
      left = Math.max(10, Math.min(left, rect.width - tipRect.width - 10));
      this.tip.style.left = left + "px";
      this.tip.style.top = "16px";
    }

    hideTip() {
      if (this.tip) this.tip.style.opacity = "0";
    }
  }

  function renderDonut(el, slices, centerTitle, centerSub) {
    const node = typeof el === "string" ? document.querySelector(el) : el;
    if (!node) return;
    const total = slices.reduce((a, s) => a + s.value, 0) || 1;
    let acc = 0;
    const stops = slices.map((s) => {
      const start = (acc / total) * 360;
      acc += s.value;
      const end = (acc / total) * 360;
      return s.color + " " + start.toFixed(1) + "deg " + end.toFixed(1) + "deg";
    });
    node.style.background = "conic-gradient(" + stops.join(", ") + ")";
    node.innerHTML =
      '<div class="donut-center"><strong>' +
      centerTitle +
      "</strong><span>" +
      (centerSub || "") +
      "</span></div>";
  }

  function renderGauge(el, percent, color) {
    const node = typeof el === "string" ? document.querySelector(el) : el;
    if (!node) return;
    const p = Math.max(0, Math.min(100, percent));
    const c = color || COLORS.green;
    node.style.background =
      "conic-gradient(" + c + " 0deg " + p * 3.6 + "deg, rgba(255,255,255,0.07) " + p * 3.6 + "deg 360deg)";
  }

  function startCounters(root) {
    const scope = root || document;
    $$("[data-count]", scope).forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";
      const duration = 1300;
      let started = false;

      const update = (t) => {
        if (t >= duration) {
          el.textContent = prefix + Number(target).toFixed(decimals) + suffix;
          return;
        }
        const p = t / duration;
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        requestAnimationFrame(update);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !started) {
              started = true;
              requestAnimationFrame(update);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(el);
    });
  }

  function initNav() {
    const toggle = $(".nav-toggle");
    const nav = $(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
      });
      $$("a", nav).forEach((a) => {
        a.addEventListener("click", () => nav.classList.remove("open"));
      });
    }

    const page = document.body.getAttribute("data-page");
    if (page) {
      $$(".nav-link[data-nav]").forEach((link) => {
        if (link.getAttribute("data-nav") === page) link.classList.add("active");
      });
    }
  }

  function initClock() {
    const nodes = $$(".js-clock");
    if (!nodes.length) return;
    const update = () => {
      const now = new Date();
      const p = (x) => String(x).padStart(2, "0");
      const text =
        now.getFullYear() +
        "-" +
        p(now.getMonth() + 1) +
        "-" +
        p(now.getDate()) +
        " " +
        p(now.getHours()) +
        ":" +
        p(now.getMinutes()) +
        ":" +
        p(now.getSeconds());
      nodes.forEach((n) => (n.textContent = text));
    };
    update();
    setInterval(update, 1000);
  }

  function initAccordion() {
    $$(".accordion-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion-item");
        const wasOpen = item.classList.contains("open");
        $$(".accordion-item.open").forEach((i) => i.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  window.App = {
    $: $,
    $$: $$,
    COLORS: COLORS,
    rnd: rnd,
    walk: walk,
    fmt: fmt,
    timeLabel: timeLabel,
    dailyPower: dailyPower,
    liveSeries: liveSeries,
    CurveChart: CurveChart,
    renderDonut: renderDonut,
    renderGauge: renderGauge,
    startCounters: startCounters,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initClock();
    initAccordion();
    startCounters();
  });
})();
