# Personal Projects

A no-build static portfolio and home for personal projects, with a
procedural canvas background animation. Plain HTML, CSS and JavaScript — no
framework, no bundler.

```
D:\web\
  index.html            Home: hero, featured + project grid, about, contact
  404.html
  assets/
    css/styles.css      Design tokens, layout, responsive, dark/light
    js/main.js          Renders cards from PROJECTS + tag filtering
    js/theme.js         Theme toggle (localStorage + prefers-color-scheme)
    js/bg.js            Procedural background engine (flow/network/automata)
    js/bg.config.js     Animation settings
    img/                Favicon and other images
  data/projects.js      window.PROJECTS = [ ... ]   ← edit me
  projects/<slug>/      Each live app lives in its own folder
```

## Add a project

1. Open `data/projects.js` and add an object to the `PROJECTS` array:

   ```js
   {
     slug: "my-app",                       // unique id
     title: "My App",
     description: "What it does, in a sentence.",
     tags: ["javascript", "canvas"],
     thumbnail: "assets/img/my-app.png",   // or "" for a placeholder
     live: "projects/my-app/",             // relative link, or ""
     repo: "https://github.com/you/my-app",// or ""
     featured: true,                       // show in Featured too
     status: "active"                      // "active" | "wip" | "archived"
   }
   ```

2. To host a live app, create `projects/my-app/index.html` (or paste a static
   build into that folder). The `live` path points at the folder, so the app
   loads at `/projects/my-app/`.

That's it — no build step. Refresh the page.

> For single-page apps (React/Vue/etc.) built with a bundler, set the build's
> base/public path to the sub-folder (e.g. `/projects/my-app/`) and copy the
> output into `projects/my-app/`.

## Customise

- **Name & bio:** edit `index.html` (brand, hero, About).
- **Social links:** edit the `<ul class="social">` block in `index.html`.
- **Background animation:** edit `assets/js/bg.config.js`. Switch modes with
  the **B** key at runtime, or set `mode` to `"flow"`, `"network"` or
  `"automata"`. Console helpers: `ProceduralBG.setMode("network")`,
  `ProceduralBG.cycle()`.
- **Colours / theme:** edit the CSS variables at the top of
  `assets/css/styles.css`. The canvas reads `--bg-accent`, `--bg-line` and
  `--bg`, so it follows the theme automatically.

## Preview locally

Any static server works. With Python installed:

```powershell
python -m http.server 8000
# then open http://localhost:8000
```

You can also just double-click `index.html` — everything is built to work from
`file://` (the animation falls back to built-in noise if the CDN is offline).

## Deploy

### Cloudflare Pages (recommended)

1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command: **(leave empty)**. Output directory: `/`.
4. Deploy, then add your custom domain under the project's **Custom domains**
   tab. DNS is handled automatically if the domain is on Cloudflare.

### GitHub Pages

1. Push to a repo. In **Settings → Pages**, set the source to your branch,
   folder `/ (root)`.
2. For a custom domain, add a file named `CNAME` at the repo root containing
   just the domain (e.g. `example.com`), then point DNS at GitHub
   (A records for an apex domain, CNAME for `www`).
3. `.nojekyll` is included so files are served as-is.

### Any static host

Upload the folder to Netlify, Vercel, S3, nginx, etc. There is no build step
and no server-side code required.

## Notes

- `data/projects.js` is a `.js` file (not `.json`) so it loads with a plain
  `<script>` tag and works from `file://` without CORS issues.
- All asset paths are relative, so the site works at a domain root or in a
  sub-folder.
- The animation respects `prefers-reduced-motion` (renders a single static
  frame) and pauses when the browser tab is hidden.
