/* Procedural background animation.
   Modes: flow | network | automata  (cycle with "B").
   Uses simplex-noise if present, otherwise falls back to built-in pseudo-noise.
   Honours prefers-reduced-motion and pauses when the tab is hidden. */
(function () {
  "use strict";

  var DEFAULTS = {
    mode: "flow",
    maxParticles: 190,
    speed: 0.55,
    noiseScale: 0.0016,
    particleSize: 1.6,
    links: true,
    linkDistance: 130,
    linkOpacity: 0.16,
    particleOpacity: 0.75,
    trail: 0.12,
    cellSize: 14,
    seed: 1337,
    accent: null,
    line: null
  };

  var cfg = {};
  for (var dk in DEFAULTS) cfg[dk] = DEFAULTS[dk];
  if (window.BG_CONFIG) for (var ck in window.BG_CONFIG) cfg[ck] = window.BG_CONFIG[ck];

  var MODES = ["flow", "network", "automata"];
  var mode = MODES.indexOf(cfg.mode) >= 0 ? cfg.mode : "flow";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas, ctx;
  var dpr = 1, W = 0, H = 0;
  var particles = [];
  var automata = null;
  var rafId = null, running = false, t = 0;

  var accent = "120,140,255";
  var lineCol = "99,102,241";
  var pageBg = "9,11,18";

  /* ---- noise -------------------------------------------------------------- */
  var noise3 = buildNoise();

  function buildNoise() {
    var SN = window.SimplexNoise;
    if (typeof SN === "function") {
      try {
        var s = new SN(function () { return Math.random(); });
        if (typeof s.noise3D === "function") {
          return function (x, y, z) { return s.noise3D(x, y, z); };
        }
      } catch (e) { /* fall through to built-in */ }
    }
    // Smooth, dependency-free pseudo-noise (sum of sines).
    return function (x, y, z) {
      return (
        Math.sin(x * 1.7 + z) +
        Math.sin(y * 2.3 - z * 0.7) +
        Math.sin((x + y) * 1.3 + z * 1.3)
      ) / 3;
    };
  }

  /* ---- colours ------------------------------------------------------------ */
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    accent = cfg.accent || clean(cs.getPropertyValue("--bg-accent")) || accent;
    lineCol = cfg.line || clean(cs.getPropertyValue("--bg-line")) || lineCol;
    pageBg = clean(cs.getPropertyValue("--bg")) || pageBg;
  }
  function clean(v) { return (v || "").trim(); }

  /* ---- setup -------------------------------------------------------------- */
  function setup() {
    canvas = document.createElement("canvas");
    canvas.className = "bg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    var host = document.querySelector("[data-bg]") || document.body;
    host.appendChild(canvas);
    ctx = canvas.getContext("2d");
    if (!ctx) return false;
    readColors();
    resize();
    return true;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (mode === "automata") initAutomata();
    else initParticles();
    if (prefersReduced) drawStatic();
  }

  /* ---- particles ---------------------------------------------------------- */
  function particleCount() {
    var area = W * H;
    var scaled = Math.round(cfg.maxParticles * Math.min(1, area / (1440 * 900)));
    var min = W < 640 ? 45 : 70;
    return Math.max(min, scaled);
  }

  function initParticles() {
    var n = particleCount();
    particles = new Array(n);
    for (var i = 0; i < n; i++) {
      particles[i] = {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7
      };
    }
  }

  function updateFlow() {
    var scale = cfg.noiseScale;
    var spd = cfg.speed;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var ang = noise3(p.x * scale, p.y * scale, t * 0.0004) * Math.PI * 3;
      p.x += Math.cos(ang) * spd;
      p.y += Math.sin(ang) * spd;
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;
    }
    t += 16;
  }

  function updateNetwork() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
      if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    var ps = particles, n = ps.length, i, j;

    if (cfg.links && n > 1) {
      var ld = cfg.linkDistance, ld2 = ld * ld;
      var buckets = [[], [], [], []];
      for (i = 0; i < n; i++) {
        var ax = ps[i].x, ay = ps[i].y;
        for (j = i + 1; j < n; j++) {
          var dx = ax - ps[j].x, dy = ay - ps[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < ld2) {
            var q = 1 - Math.sqrt(d2) / ld;
            var b = Math.min(3, (q * 4) | 0);
            buckets[b].push(i, j);
          }
        }
      }
      ctx.lineWidth = 1;
      for (var bi = 0; bi < 4; bi++) {
        var arr = buckets[bi];
        if (!arr.length) continue;
        var alpha = (((bi + 0.5) / 4) * cfg.linkOpacity).toFixed(3);
        ctx.strokeStyle = "rgba(" + lineCol + "," + alpha + ")";
        ctx.beginPath();
        for (var k = 0; k < arr.length; k += 2) {
          var a = ps[arr[k]], c = ps[arr[k + 1]];
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
        }
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(" + accent + "," + cfg.particleOpacity + ")";
    var r = cfg.particleSize;
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(ps[i].x, ps[i].y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---- automata ----------------------------------------------------------- */
  function initAutomata() {
    var cs = cfg.cellSize;
    var cols = Math.max(1, Math.ceil(W / cs));
    var rows = Math.max(1, Math.ceil(H / cs));
    var grid = new Uint8Array(cols * rows);
    for (var i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.16 ? 1 : 0;
    automata = { cols: cols, rows: rows, grid: grid, acc: 0 };
  }

  function stepAutomata() {
    var a = automata, cols = a.cols, rows = a.rows, g = a.grid;
    var next = new Uint8Array(g.length);
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var n = 0;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            var nx = (x + dx + cols) % cols;
            var ny = (y + dy + rows) % rows;
            n += g[ny * cols + nx];
          }
        }
        var alive = g[y * cols + x];
        next[y * cols + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
      }
    }
    a.grid = next;
  }

  function drawAutomata(fade) {
    if (fade) {
      ctx.fillStyle = "rgba(" + pageBg + "," + cfg.trail + ")";
    } else {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(" + pageBg + ",1)";
    }
    ctx.fillRect(0, 0, W, H);

    var a = automata, cs = cfg.cellSize, g = a.grid, cols = a.cols, rows = a.rows;
    ctx.fillStyle = "rgba(" + accent + ",0.85)";
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (g[y * cols + x]) ctx.fillRect(x * cs, y * cs, cs - 1, cs - 1);
      }
    }
  }

  /* ---- loop --------------------------------------------------------------- */
  function tick() {
    if (mode === "automata") {
      automata.acc++;
      if (automata.acc >= 7) { automata.acc = 0; stepAutomata(); }
      drawAutomata(true);
    } else {
      if (mode === "flow") updateFlow(); else updateNetwork();
      drawParticles();
    }
  }

  function loop() {
    if (!running) return;
    tick();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || prefersReduced || !ctx) return;
    running = true;
    loop();
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function drawStatic() {
    if (!ctx) return;
    if (mode === "automata") drawAutomata(false);
    else drawParticles();
  }

  function setMode(next) {
    if (MODES.indexOf(next) < 0) return;
    mode = next;
    t = 0;
    if (mode === "automata") initAutomata();
    else initParticles();
    if (prefersReduced) drawStatic();
    document.dispatchEvent(new CustomEvent("bgmodechange", { detail: { mode: mode } }));
  }

  function cycleMode() {
    setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }

  /* ---- events / init ------------------------------------------------------ */
  function debounce(fn, ms) {
    var id;
    return function () {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }

  function init() {
    if (!setup()) return;
    window.ProceduralBG = {
      cycle: cycleMode,
      setMode: setMode,
      getMode: function () { return mode; }
    };
    if (prefersReduced) { drawStatic(); return; }
    start();
  }

  window.addEventListener("resize", debounce(function () {
    readColors();
    resize();
  }, 150));

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  document.addEventListener("themechange", function () {
    readColors();
    if (mode === "automata") drawAutomata(false);
  });

  window.addEventListener("keydown", function (e) {
    if (e.key !== "b" && e.key !== "B") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = e.target && e.target.tagName;
    if (tag && /INPUT|TEXTAREA|SELECT/.test(tag)) return;
    cycleMode();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
