/* ============================================================================
   Your projects — edit this file to add or change entries.
   Each object becomes a card on the home page. Field guide:

     slug        (required) unique id; also the folder name under /projects/
     title       (required) card + link text
     description (required) short summary
     tags        array of strings, used for the filter chips
     thumbnail   image path, e.g. "assets/img/my-project.png"
                 leave "" to show a coloured placeholder with the initial
     live        relative path to the running app, e.g. "projects/my-app/"
                 point at a folder containing index.html; leave "" if none
     repo        full URL to the source; leave "" if none
     featured    true to also show it in the Featured section
     status      "active" | "wip" | "archived"
   ========================================================================== */

window.PROJECTS = [
  {
    slug: "example-app",
    title: "Example App",
    description: "A placeholder live app that shows how projects are wired up. Replace it with your own.",
    tags: ["demo", "javascript"],
    thumbnail: "",
    live: "projects/example-app/",
    repo: "",
    featured: true,
    status: "active"
  },
  {
    slug: "city-game",
    title: "City Game",
    description: "A 2d Isometric City-builder created in Unity, with assistance from Claude Code",
    tags: ["canvas", "generative"],
    thumbnail: "",
    live: "projects/city-game/",
    repo: "https://github.com/jpm20000/City-Game",
    featured: true,
    status: "Prototype"
  },
  {
    slug: "automata-lab",
    title: "Cellular Automata Lab",
    description: "Playing with grid rules and emergent behaviour.",
    tags: ["canvas", "generative"],
    thumbnail: "",
    live: "",
    repo: "",
    featured: false,
    status: "wip"
  }
];
