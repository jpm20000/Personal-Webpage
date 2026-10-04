// Configuration for the procedural background animation.
// Live mode can also be cycled by pressing "B" on the page.
window.BG_CONFIG = {
  // "flow" (particles in a noise flow field + proximity links)
  // "network" (drifting constellation)
  // "automata" (grid cellular automaton with trails)
  mode: "flow",

  maxParticles: 190,     // upper bound; auto-scaled down on smaller screens
  speed: 0.55,           // particle speed (flow mode)
  noiseScale: 0.0016,    // flow field zoom — lower = smoother, larger swirls
  particleSize: 1.6,     // particle radius in px

  links: true,           // draw lines between nearby particles
  linkDistance: 130,     // max distance for a link, px
  linkOpacity: 0.16,     // overall link strength
  particleOpacity: 0.75,

  trail: 0.12,           // automata fade amount (lower = longer trails)
  cellSize: 14,          // automata cell size, px

  seed: 1337,

  // Optional fixed colours as "r,g,b". Leave null to inherit from the CSS theme.
  accent: null,
  line: null
};
