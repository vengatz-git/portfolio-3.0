/* Replace only this block when connecting the static contact form. */
const SITE_CONFIG = {
  formEndpoint: "https://formspree.io/f/REPLACE_WITH_FORM_ID",
  contactEmail: "hello@yourdomain.com"
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initNavigation() {
  const header = $("#site-header");
  const progress = $(".scroll-progress");
  const mobileMenu = $("#mobile-menu");
  const menuToggle = $(".menu-toggle");
  const navLinks = $$(".nav-link, .mobile-menu a");
  const sections = $$("main section[id]");

  const setScrolledState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };

  const closeMenu = () => {
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  menuToggle.addEventListener("click", () => {
    const open = !menuToggle.classList.contains("is-open");
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("scroll", setScrolledState, { passive: true });
  window.addEventListener("resize", setScrolledState);
  setScrolledState();

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.section === entry.target.id));
    });
  }, { rootMargin: "-42% 0px -48%", threshold: 0 });
  sections.forEach((section) => activeObserver.observe(section));
}

function initRevealAnimations() {
  const items = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -35px" });
  items.forEach((item) => revealObserver.observe(item));
}

function initHeroInteractions() {
  const hero = $(".hero");
  const stage = $("[data-tilt-card]", hero);
  if (!hero || !finePointer || prefersReducedMotion) return;
  const parallaxItems = $$('[data-parallax]', hero);
  let frame;
  let pointer = { x: 0, y: 0 };

  const render = () => {
    frame = null;
    const rect = hero.getBoundingClientRect();
    const x = (pointer.x - (rect.left + rect.width / 2)) / rect.width;
    const y = (pointer.y - (rect.top + rect.height / 2)) / rect.height;
    hero.style.setProperty("--pointer-x", `${pointer.x - rect.left}px`);
    hero.style.setProperty("--pointer-y", `${pointer.y - rect.top}px`);
    $(".hero-glow", hero).style.transform = `translate(calc(-50% + ${x * 90}px), calc(-50% + ${y * 70}px))`;
    parallaxItems.forEach((item) => {
      const intensity = Number(item.dataset.parallax) * 35;
      item.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
    });
    if (stage) stage.style.transform = `perspective(1000px) rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`;
  };

  hero.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(render);
  });
  hero.addEventListener("pointerleave", () => {
    parallaxItems.forEach((item) => { item.style.transform = ""; });
    if (stage) stage.style.transform = "";
  });
}

function initCursor() {
  if (!finePointer || prefersReducedMotion) return;
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  document.body.classList.add("has-custom-cursor");
  document.addEventListener("pointermove", (event) => {
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
  }, { passive: true });
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("a, button, input, textarea, [data-cursor-label]");
    if (!target) return;
    ring.classList.add("is-hovering");
    if (target.dataset.cursorLabel) {
      ring.classList.add("has-label");
      ring.dataset.label = target.dataset.cursorLabel;
    }
  });
  document.addEventListener("pointerout", (event) => {
    if (!event.target.closest("a, button, input, textarea, [data-cursor-label]")) return;
    ring.classList.remove("is-hovering", "has-label");
    ring.removeAttribute("data-label");
  });
}

function initMagneticButtons() {
  if (!finePointer || prefersReducedMotion) return;
  $$(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .12;
      const y = (event.clientY - rect.top - rect.height / 2) * .18;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

function initMindsetCards() {
  $$(".mindset-card").forEach((card) => card.addEventListener("click", () => {
    $$(".mindset-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-expanded", String(selected));
    });
  }));
}

const projectViews = {
  feed: { count: "01 — 03", kicker: "Curated for you", title: "Find something<br>worth saving.", search: "⌕&nbsp; Search visual ideas", filter: "Filter" },
  profile: { count: "02 — 03", kicker: "A living collection", title: "Follow the<br>thread.", search: "⌕&nbsp; Search profiles", filter: "Edit profile" },
  board: { count: "03 — 03", kicker: "Your saved board", title: "Keep the<br>good stuff.", search: "⌕&nbsp; Search saved pins", filter: "Sort" }
};

function initProjectInteractions() {
  const productContent = $("#product-content");
  const count = $(".project-count");
  const titleRow = $(".product-title-row");
  const tabButtons = $$(".view-tab");
  const featureCopy = {
    feed: ["01", "Masonry discovery", "Content finds its rhythm through a visual feed that keeps browsing feeling open-ended."],
    media: ["02", "Cloudinary media", "Uploads are treated as a product workflow: resilient, organized, and ready to be discovered."],
    social: ["03", "Community signals", "Comments and replies give the visual layer a human voice without getting in the way." ]
  };

  tabButtons.forEach((tab) => tab.addEventListener("click", () => {
    const view = projectViews[tab.dataset.view];
    tabButtons.forEach((item) => { item.classList.toggle("is-active", item === tab); item.setAttribute("aria-selected", String(item === tab)); });
    productContent.classList.add("is-switching");
    window.setTimeout(() => {
      $(".product-kicker", titleRow).textContent = view.kicker;
      $(".product-title-row h3", titleRow).innerHTML = view.title;
      $(".product-search", productContent.parentElement).innerHTML = view.search;
      $(".product-filter", titleRow).childNodes[0].textContent = `${view.filter} `;
      count.textContent = view.count;
      productContent.classList.remove("is-switching");
    }, prefersReducedMotion ? 0 : 180);
  }));

  const callout = $("#feature-callout");
  const showFeature = (key) => {
    const [number, title, body] = featureCopy[key];
    $(".callout-pin", callout).textContent = number;
    $(".feature-callout strong", callout).textContent = title;
    $(".feature-callout p", callout).textContent = body;
    callout.classList.add("is-visible");
  };
  $$(".feature-hotspot").forEach((hotspot) => hotspot.addEventListener("click", () => showFeature(hotspot.dataset.feature)));
  $(".callout-close").addEventListener("click", () => callout.classList.remove("is-visible"));

  $$(".detail-row").forEach((row) => row.addEventListener("click", () => {
    const open = row.classList.contains("is-open");
    $$(".detail-row").forEach((item) => { item.classList.remove("is-open"); item.setAttribute("aria-expanded", "false"); });
    if (!open) { row.classList.add("is-open"); row.setAttribute("aria-expanded", "true"); }
  }));
}

const architectureCopy = {
  next: ["Next.js / React", "The interface and routing layer: fast page transitions, server-rendered surfaces, and a component system that stays close to the product language."],
  server: ["Server Actions / APIs", "The connective tissue between intention and persistence, keeping mutations explicit and giving each user action a dependable path."],
  drizzle: ["Drizzle ORM", "The typed boundary around the data model, translating product concepts into queries that stay visible and reviewable."],
  postgres: ["PostgreSQL", "The relational source of truth for users, pins, boards, comments, and the relationships that make discovery personal."],
  cloudinary: ["Cloudinary", "The media layer for image uploads, transformation, and delivery so the visual product can stay quick without reinventing storage."],
  auth: ["Auth.js", "The identity layer for Google and GitHub sign-in, sessions, and the permissions that make personal collections possible."],
  neon: ["Neon / Vercel", "The deployment edge: a serverless-friendly Postgres foundation and a platform that keeps the full application close to its users."]
};

function initArchitecture() {
  const explanation = $("#arch-explanation");
  $$(".arch-node").forEach((node) => node.addEventListener("click", () => {
    const [title, description] = architectureCopy[node.dataset.arch];
    $$(".arch-node").forEach((item) => item.classList.toggle("is-active", item === node));
    $(".arch-explanation strong", explanation).textContent = title;
    $(".arch-explanation p", explanation).textContent = description;
  }));
}

const timelineCopy = {
  foundation: ["01", "Start with trust.", "Authentication and a dependable data model create the floor every other InspireStack feature can stand on."],
  core: ["02", "Make the object real.", "Pins and uploads turn a concept into a thing people can actually collect, revisit, and build on."],
  discovery: ["03", "Give it a rhythm.", "The masonry feed makes browsing feel less like a list and more like a living surface of possibility."],
  organization: ["04", "Let people make it theirs.", "Boards and saved pins add a personal layer: a way to move from passing inspiration to intentional collections."],
  community: ["05", "Leave room for response.", "Comments and replies let the product become a conversation without pulling focus from the visual work."],
  profiles: ["06", "Connect the dots.", "Search and profile customization make the discovery loop feel complete: find, save, shape, return."]
};

function initTimeline() {
  const detail = $("#timeline-detail");
  const steps = $$(".timeline-step");
  steps.forEach((step, index) => step.addEventListener("click", () => {
    const [number, title, description] = timelineCopy[step.dataset.step];
    steps.forEach((item) => { item.classList.toggle("is-active", item === step); item.setAttribute("aria-selected", String(item === step)); });
    $(".timeline").style.setProperty("--timeline-progress", `${(index / (steps.length - 1)) * 100}%`);
    detail.animate?.([{ opacity: .35, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: prefersReducedMotion ? 0 : 260, easing: "ease-out" });
    $(".timeline-detail span", detail).textContent = `Current layer / ${number}`;
    $(".timeline-detail h4", detail).textContent = title;
    $(".timeline-detail p", detail).textContent = description;
  }));
}

const technologyData = {
  "HTML": { category: "frontend", short: "HTML", description: "The semantic foundation: structure that keeps the interface clear for people, browsers, and assistive technology.", related: ["CSS", "JavaScript"] },
  "CSS": { category: "frontend", short: "CSS", description: "The visual system for hierarchy, responsive layout, motion, and the small details that make a surface feel intentional.", related: ["HTML", "JavaScript"] },
  "JavaScript": { category: "frontend", short: "JS", description: "The interaction layer: state, progressive enhancement, and the small moments that let the product respond like a product.", related: ["TypeScript", "React"] },
  "TypeScript": { category: "frontend", short: "TS", description: "The shared language between product intent and implementation, keeping the application understandable as it grows.", related: ["React", "Next.js", "Zod"] },
  "React": { category: "frontend", short: "RE", description: "A component model for composing rich product surfaces while keeping interactions close to the parts they affect.", related: ["TypeScript", "Next.js"] },
  "Next.js": { category: "frontend", short: "NX", description: "The application frame for InspireStack: routing, server-rendered surfaces, and a clear path from interface to server logic.", related: ["React", "Vercel", "Auth.js"] },
  "Tailwind CSS": { category: "frontend", short: "TW", description: "A constrained vocabulary for shipping consistent interface decisions quickly without losing the ability to make the product distinct.", related: ["Next.js", "React"] },
  "Node.js": { category: "backend", short: "NO", description: "The runtime for server-side JavaScript and the connective logic that makes full-stack work feel like one system.", related: ["REST APIs", "Zod"] },
  "REST APIs": { category: "backend", short: "API", description: "Explicit boundaries for reading and changing product data, with predictable inputs, outputs, and failure states.", related: ["Node.js", "PostgreSQL"] },
  "Auth.js": { category: "backend", short: "AU", description: "Authentication for Google and GitHub sign-in, sessions, and the user boundaries that make personal collections possible.", related: ["Next.js", "PostgreSQL"] },
  "Zod": { category: "backend", short: "ZO", description: "Runtime validation that keeps external input honest before it reaches the rest of the application.", related: ["TypeScript", "REST APIs"] },
  "PostgreSQL": { category: "database", short: "PG", description: "Used as the primary relational database for InspireStack, with Drizzle ORM providing type-safe database access.", related: ["Drizzle ORM", "Neon", "Auth.js"] },
  "Drizzle ORM": { category: "database", short: "DR", description: "The typed data access layer that makes the relationships behind pins, boards, users, and comments explicit.", related: ["PostgreSQL", "TypeScript"] },
  "Neon": { category: "database", short: "NE", description: "A serverless-friendly Postgres home for the application data, designed to stay close to the deployed product.", related: ["PostgreSQL", "Vercel"] },
  "Git": { category: "infrastructure", short: "GI", description: "A durable record of decisions, experiments, and the changes that move a product from thought to shipped surface.", related: ["GitHub", "Vercel"] },
  "GitHub": { category: "infrastructure", short: "GH", description: "The place where code, issues, and the reasoning around a product can stay visible and collaborative.", related: ["Git", "Vercel"] },
  "Vercel": { category: "infrastructure", short: "VE", description: "The deployment edge for the full application, keeping the build and its hosting close to the way the product is developed.", related: ["Next.js", "Neon"] },
  "Cloudinary": { category: "infrastructure", short: "CL", description: "Media management for InspireStack: uploads, transformations, and delivery without making image handling a side quest.", related: ["Next.js", "PostgreSQL"] }
};

const categoryNames = { frontend: "Frontend", backend: "Backend", database: "Database", infrastructure: "Infrastructure" };

function initTechnologyExplorer() {
  const list = $("#tech-list");
  const detail = $("#tech-detail");
  const tabs = $$(".category-tab");
  let activeCategory = "frontend";
  let activeTechnology = "TypeScript";

  const selectTechnology = (name) => {
    const tech = technologyData[name];
    activeTechnology = name;
    $$(".tech-chip", list).forEach((chip) => chip.classList.toggle("is-selected", chip.dataset.tech === name));
    $("#detail-orb").textContent = tech.short;
    $("#tech-name").textContent = name;
    $("#tech-description").textContent = tech.description;
    $("#tech-category").textContent = categoryNames[tech.category];
    $("#related-tech div").innerHTML = tech.related.map((related) => `<b>${related}</b>`).join("");
    const position = Object.keys(technologyData).indexOf(name) + 1;
    $(".tech-detail .detail-meta span:last-child").textContent = `${String(position).padStart(2, "0")} / 18 technologies`;
  };

  const renderCategory = (category) => {
    activeCategory = category;
    const names = Object.keys(technologyData).filter((name) => technologyData[name].category === category);
    list.innerHTML = names.map((name, index) => `<button class="tech-chip" type="button" data-tech="${name}" aria-pressed="false"><span class="tech-chip-index">${String(index + 1).padStart(2, "0")}</span><span class="tech-chip-name">${name}</span><span class="tech-chip-arrow">↗</span></button>`).join("");
    $$(".tech-chip", list).forEach((chip) => chip.addEventListener("click", () => selectTechnology(chip.dataset.tech)));
    const first = names.includes(activeTechnology) ? activeTechnology : names[0];
    selectTechnology(first);
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((item) => { item.classList.toggle("is-active", item === tab); item.setAttribute("aria-selected", String(item === tab)); });
    renderCategory(tab.dataset.category);
  }));
  renderCategory(activeCategory);
}

function initContactForm() {
  const form = $("#contact-form");
  const success = $("#form-success");
  const status = $("#form-status");
  const submit = $("[type='submit']", form);
  const fields = ["name", "email", "message"].map((id) => $(`#${id}`));
  if (!form) return;

  form.action = SITE_CONFIG.formEndpoint;
  form.method = "POST";

  const errorFor = (field, message = "") => {
    const wrap = field.closest(".form-field");
    const error = $(`[data-error-for="${field.id}"]`);
    wrap.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
  };

  const validate = () => {
    let valid = true;
    fields.forEach((field) => {
      const value = field.value.trim();
      let message = "";
      if (!value) message = "This field needs a little something.";
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Try a complete email address.";
      errorFor(field, message);
      if (message) valid = false;
    });
    return valid;
  };

  const setStatus = (message, type = "") => { status.textContent = message; status.className = `form-status ${type}`.trim(); };
  fields.forEach((field) => field.addEventListener("input", () => { if (field.value.trim()) errorFor(field); }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");
    if (!validate()) return;
    if (SITE_CONFIG.formEndpoint.includes("REPLACE_WITH_FORM_ID")) {
      setStatus("The form is ready. Replace the Formspree endpoint in js/script.js to enable delivery.", "is-info");
      return;
    }
    submit.disabled = true;
    $(".submit-label", submit).hidden = true;
    $(".submit-loading", submit).hidden = false;
    try {
      const response = await fetch(SITE_CONFIG.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Submission failed");
      form.hidden = true;
      success.hidden = false;
      setStatus("");
    } catch (error) {
      setStatus("Something interrupted the send. Please try again or use the email link.");
    } finally {
      submit.disabled = false;
      $(".submit-label", submit).hidden = false;
      $(".submit-loading", submit).hidden = true;
    }
  });

  $("#reset-form").addEventListener("click", () => {
    form.reset();
    fields.forEach((field) => errorFor(field));
    success.hidden = true;
    form.hidden = false;
    fields[0].focus();
  });
}

function initEasterEgg() {
  const drawer = $("#terminal-drawer");
  const close = $("#terminal-close");
  const trigger = $("#egg-trigger");
  let sequence = "";
  const open = () => { drawer.hidden = false; close.focus(); };
  const closeDrawer = () => { drawer.hidden = true; };
  trigger.addEventListener("click", open);
  close.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (event) => { if (event.target === drawer) closeDrawer(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      sequence = `${sequence}${event.key.toLowerCase()}`.slice(-4);
      if (sequence === "guts") { open(); sequence = ""; }
    }
  });
}

function initYear() {
  $("#current-year").textContent = new Date().getFullYear();
}

function init() {
  initNavigation();
  initRevealAnimations();
  initHeroInteractions();
  initCursor();
  initMagneticButtons();
  initMindsetCards();
  initProjectInteractions();
  initArchitecture();
  initTimeline();
  initTechnologyExplorer();
  initContactForm();
  initEasterEgg();
  initYear();
}

init();
