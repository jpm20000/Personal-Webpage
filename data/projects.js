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
    slug: "flow-field",
    title: "Flow Field Study",
    description: "Procedural particle experiments exploring noise-based motion. Coming soon.",
    tags: ["canvas", "generative"],
    thumbnail: "",
    live: "",
    repo: "",
    featured: false,
    status: "wip"
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
