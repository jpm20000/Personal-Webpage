/* Renders the project grid from window.PROJECTS and wires up tag filtering. */
(function () {
  "use strict";

  var projects = Array.isArray(window.PROJECTS) ? window.PROJECTS.slice() : [];

  var featuredEl = document.getElementById("featured");
  var featuredGrid = document.getElementById("featured-grid");
  var grid = document.getElementById("projects-grid");
  var filterBar = document.getElementById("tag-filter");
  var emptyEl = document.getElementById("empty-state");
  var countEl = document.getElementById("project-count");
  var yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var activeTag = "All";
  var STATUS_LABELS = { wip: "WIP", prototype: "Prototype", archived: "Archived", active: "" };

  function linkEl(href, text, external) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (external && /^https?:/i.test(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function makeCard(p) {
    var article = document.createElement("article");
    article.className = "card";

    var media = document.createElement("div");
    media.className = "card-media";
    if (p.thumbnail) {
      var img = document.createElement("img");
      img.src = p.thumbnail;
      img.alt = (p.title || "Project") + " preview";
      img.loading = "lazy";
      if (p.thumbnailFit === "contain") img.className = "fit-contain";
      media.appendChild(img);
    } else {
      media.textContent = (p.title || "?").trim().charAt(0).toUpperCase();
    }
    article.appendChild(media);

    var body = document.createElement("div");
    body.className = "card-body";

    var head = document.createElement("div");
    head.className = "card-head";

    var h3 = document.createElement("h3");
    h3.className = "card-title";
    var titleHref = p.details || p.live;
    if (titleHref) {
      h3.appendChild(linkEl(titleHref, p.title || p.slug, false));
    } else {
      h3.textContent = p.title || p.slug;
    }
    head.appendChild(h3);

    var statusLabel = p.status ? STATUS_LABELS[String(p.status).toLowerCase()] : "";
    if (statusLabel) {
      var badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = statusLabel;
      head.appendChild(badge);
    }
    body.appendChild(head);

    if (p.description) {
      var desc = document.createElement("p");
      desc.className = "card-desc";
      desc.textContent = p.description;
      body.appendChild(desc);
    }

    if (p.tags && p.tags.length) {
      var ul = document.createElement("ul");
      ul.className = "tags";
      p.tags.forEach(function (tag) {
        var li = document.createElement("li");
        li.textContent = tag;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    var links = document.createElement("div");
    links.className = "card-links";
    if (p.live) links.appendChild(linkEl(p.live, p.cta || "Live demo", false));
    if (p.repo) links.appendChild(linkEl(p.repo, "Source", true));
    if (!p.live && !p.repo) {
      var soon = document.createElement("span");
      soon.className = "muted";
      soon.textContent = "Coming soon";
      links.appendChild(soon);
    }
    body.appendChild(links);

    article.appendChild(body);
    return article;
  }

  function allTags() {
    var seen = {};
    projects.forEach(function (p) {
      (p.tags || []).forEach(function (tag) { seen[tag] = true; });
    });
    return Object.keys(seen).sort();
  }

  function renderFilters() {
    if (!filterBar) return;
    var tags = ["All"].concat(allTags());
    filterBar.innerHTML = "";
    if (tags.length <= 2) return;

    tags.forEach(function (tag) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (tag === activeTag ? " is-active" : "");
      b.textContent = tag;
      b.setAttribute("aria-pressed", tag === activeTag ? "true" : "false");
      b.addEventListener("click", function () {
        activeTag = tag;
        renderFilters();
        renderGrid();
      });
      filterBar.appendChild(b);
    });
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    var list = projects.filter(function (p) {
      return activeTag === "All" || (p.tags || []).indexOf(activeTag) >= 0;
    });
    list.forEach(function (p) { grid.appendChild(makeCard(p)); });
    if (emptyEl) emptyEl.hidden = list.length !== 0;
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " project" : " projects");
  }

  function renderFeatured() {
    if (!featuredEl || !featuredGrid) return;
    var list = projects.filter(function (p) { return p.featured; });
    if (!list.length) { featuredEl.hidden = true; return; }
    featuredEl.hidden = false;
    featuredGrid.innerHTML = "";
    list.forEach(function (p) { featuredGrid.appendChild(makeCard(p)); });
  }

  renderFeatured();
  renderFilters();
  renderGrid();
})();
