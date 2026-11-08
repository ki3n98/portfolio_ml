// main.js — entry point. Every feature lives in its own module; this file only wires
// them up. Init order matches the original single-file order: several features add
// document-level Escape/click listeners and their registration order matters.
// Feature -> file map: see AGENTS.md.

import { initBootScreen } from './boot-screen.js';
import { initStartMenu } from './desktop/start-menu.js';
import { initWindowManager } from './desktop/window-manager.js';
import { initWindowDrag } from './desktop/window-drag.js';
import { initWindowResize } from './desktop/window-resize.js';
import { initTrayClock } from './desktop/tray-clock.js';
import { initContactForm } from './apps/contact-form.js';
import { initNotepad } from './apps/notepad.js';
import { initExplorer } from './apps/explorer/index.js';
import { initCalculator } from './apps/calculator.js';
import { initPaint } from './apps/paint/index.js';
import { initExperienceWindow } from './apps/experience-window.js';
import { initGradientDescent } from './apps/gradient-descent/index.js';
import { isMobile } from './utils.js';
import { isTopWindow, closeWindow, toggleMaximize, toggleOrFocusWindow } from './desktop/window-manager.js';
import { PORTFOLIO_PROJECTS } from './data/projects.js';
import { PORTFOLIO_EXPERIENCE } from './data/experience.js';

initBootScreen();
initStartMenu();
initWindowManager();
initWindowDrag();
initWindowResize();
initTrayClock();
initContactForm();
initNotepad();
initExplorer();
initCalculator();
initPaint();
initExperienceWindow();
initGradientDescent();
// ===========================
// 3. Portfolio Hub ("C:\Kien Pham" Explorer window)
// ===========================
// The recruiter-facing landing view: bio, experience, projects and skills
// all visible at once, with every external link reachable in one click.
(function () {
  const hubWin = document.getElementById('window-portfolio');
  if (!hubWin) return;

  const RESUME_PDF = 'assets/resume/Kien_Pham_resume.pdf';
  const GITHUB = 'https://github.com/ki3n98';
  const LINKEDIN = 'https://www.linkedin.com/in/kien-t-pham/';

  const EXPERIENCE = PORTFOLIO_EXPERIENCE;

  // [label, icon] — icon is an assets/icons/*.svg basename, or null for text-only chips.
  const SKILL_GROUPS = [
    { name: 'Machine Learning', skills: [['PyTorch', 'pytorch'], ['TensorFlow', 'tensorflow'], ['scikit-learn', null], ['Deep Learning', 'deep-learning'], ['SHAP', null], ['Model Fine-tuning', null], ['Concept Drift', null], ['Matplotlib', null]] },
    { name: 'NLP & LLMs', skills: [['NLP', 'nlp'], ['Embeddings', null], ['LangChain', 'langchain'], ['LangGraph Agents', null], ['Gemini / OpenAI APIs', null], ['Whisper (STT)', null], ['Prompt Engineering', null], ['Multi-agent Orchestration', null]] },
    { name: 'Computer Vision', skills: [['Computer Vision', 'computer-vision'], ['YOLOv11', null], ['Faster R-CNN / SSD', null], ['FaceNet', null], ['MediaPipe', null], ['OpenCV', null]] },
    { name: 'Backend & Data', skills: [['Python', 'python'], ['FastAPI', 'fastapi'], ['REST API', 'rest-api'], ['WebSockets', null], ['PostgreSQL', 'postgresql'], ['SQLAlchemy', null], ['Django', null], ['Data Labeling & Evaluation', null]] },
    { name: 'Web & DevOps', skills: [['Next.js', 'nextjs'], ['JavaScript', 'javascript'], ['HTML', 'html'], ['CSS', 'css'], ['Docker', 'docker'], ['AWS', 'aws'], ['Git / GitHub', null]] },
  ];

  const projects = PORTFOLIO_PROJECTS.filter(p => p.includeInOverview !== false);
  const isWin = (p) => /best|award/i.test(p.award || '');
  const awardHtml = (p, tag) => p.award
    ? `<${tag} class="hub__award${isWin(p) ? ' hub__award--win' : ''}">${isWin(p) ? '🏆 ' : ''}${esc(p.award)}</${tag}>`
    : '';

  const esc = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isExternal = (url) => /^https?:/.test(url);
  const youtubeId = (url) => (url && url.match(/embed\/([\w-]+)/) || [])[1];

  function projectLinks(p) {
    return [
      [p.link, (p.ctaLabel || 'View Project →').replace(/\s*→$/, '')],
      [p.secondaryLink, p.secondaryLabel],
      [p.tertiaryLink, p.tertiaryLabel],
    ].filter(([url]) => url);
  }

  function linkHtml([url, label], cls) {
    const ext = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="${cls}" href="${esc(url)}"${ext}>${esc(label)}</a>`;
  }

  function thumbHtml(p) {
    if (p.mediaSrc && p.mediaType === 'Video') {
      return `<video class="hub__thumb-media" src="${esc(p.mediaSrc)}#t=1" muted loop playsinline preload="metadata" data-hover-play></video>`;
    }
    const yt = youtubeId(p.mediaEmbed);
    if (yt) return `<img class="hub__thumb-media" src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy" />`;
    if (p.mediaSrc) return `<img class="hub__thumb-media" src="${esc(p.mediaSrc)}" alt="" loading="lazy" />`;
    return '';
  }

  // ----- Sidebar (reuses the file explorer's task-pane styles) -----
  function sidebarSection(title, body) {
    return `<div class="explorer__sidebar-section">
      <button type="button" class="explorer__sidebar-header"><span>${title}</span>
        <span class="explorer__sidebar-chevron" aria-hidden="true">&#9650;</span></button>
      <div class="explorer__sidebar-list">${body}</div>
    </div>`;
  }
  const sideLink = (label, icon, attrs) =>
    `<a class="explorer__sidebar-link" ${attrs}><span class="explorer__sidebar-link-icon" style="--icon-url: url('${icon}')" aria-hidden="true"></span>${label}</a>`;
  const sideBtn = (label, icon, windowId) =>
    `<button type="button" class="explorer__sidebar-link" data-hub-open="${windowId}"><span class="explorer__sidebar-link-icon" style="--icon-url: url('${icon}')" aria-hidden="true"></span>${label}</button>`;

  // Awards not tied to a project tile (AIS Datathon 2026 — Best Project)
  const OTHER_AWARDS = 1;
  const awards = projects.filter(isWin).length + OTHER_AWARDS;
  const sidebar = document.getElementById('hub-sidebar');
  sidebar.innerHTML =
    sidebarSection('Quick Links',
      sideBtn('View Resume.pdf', '../assets/icons/resume-pdf.png', 'resume') +
      sideLink('Download Resume', '../assets/icons/my-documents.png', `href="${RESUME_PDF}" download`) +
      sideLink('GitHub', '../assets/icons/publish-web.png', `href="${GITHUB}" target="_blank" rel="noopener noreferrer"`) +
      sideLink('LinkedIn', '../assets/icons/address-book.png', `href="${LINKEDIN}" target="_blank" rel="noopener noreferrer"`) +
      sideBtn('Contact Me', '../assets/icons/email.png', 'contact')) +
    sidebarSection('Other Places',
      sideBtn('Gradient Descent.exe', '../assets/icons/slideshow.png', 'projects') +
      sideBtn('About Me', '../assets/icons/my-computer.png', 'hero') +
      sideBtn('My Documents', '../assets/icons/my-documents.png', 'my-documents') +
      sideBtn('Paint', '../assets/icons/paint.png', 'paint')) +
    sidebarSection('Details',
      `<div class="explorer__sidebar-details">
        <span class="explorer__sidebar-details-icon" style="--icon-url: url('../assets/icons/local-disk.png')" aria-hidden="true"></span>
        <span class="explorer__sidebar-details-text">
          <span class="explorer__sidebar-details-title">Kien Pham</span>
          <span class="explorer__sidebar-details-desc">Data Scientist<br>${EXPERIENCE.length} positions &middot; ${projects.length} projects<br>${awards} awards won</span>
        </span>
      </div>`);

  // Mobile-only quick link row (sidebar is hidden on small screens)
  document.getElementById('hub-quick').innerHTML =
    `<button type="button" class="hub__quick-btn" data-hub-open="resume">Resume</button>` +
    `<a class="hub__quick-btn" href="${GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a>` +
    `<a class="hub__quick-btn" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` +
    `<button type="button" class="hub__quick-btn" data-hub-open="contact">Contact</button>`;

  // ----- Highlights strip (at-a-glance proof points) -----
  const HIGHLIGHTS = [
    ['🏆', `${awards} awards`, '2 hackathon Best Overall · AIS Datathon 2026 Best Project · Senior Design'],
    ['📄', '1 published paper', 'CSU CS Conference, 2026'],
  ];
  document.getElementById('hub-highlights').innerHTML = HIGHLIGHTS.map(([icon, big, small]) =>
    `<div class="hub__highlight"><span class="hub__highlight-icon" aria-hidden="true">${icon}</span>`
    + `<span><span class="hub__highlight-big">${esc(big)}</span><span class="hub__highlight-small">${esc(small)}</span></span></div>`).join('');

  // ----- Experience -----
  document.getElementById('hub-exp-heading').textContent = `Experience (${EXPERIENCE.length})`;
  document.getElementById('hub-exp').innerHTML = EXPERIENCE.map(e => {
    return `<article class="hub__exp-tile">
      <span class="hub__exp-icon" style="--icon-url: url('${e.icon}')" aria-hidden="true"></span>
      <div class="hub__exp-main">
        <div class="hub__exp-head">
          <h3 class="hub__exp-org">${esc(e.org)}</h3>
          <span class="hub__exp-dates">${esc(e.dates)}</span>
        </div>
        <p class="hub__exp-role">${esc(e.role)}</p>
        ${e.context ? `<p class="hub__exp-context">${esc(e.context)}</p>` : ''}
        <ul class="hub__exp-list-items">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <div class="hub__tags">${e.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
        ${e.links ? `<div class="hub__proj-links">${e.links.map(l => linkHtml(l, 'hub__link')).join('')}</div>` : ''}
      </div>
    </article>`;
  }).join('');

  // ----- Projects -----
  document.getElementById('hub-proj-heading').textContent = `Projects (${projects.length})`;
  const projGrid = document.getElementById('hub-proj');
  projGrid.innerHTML = projects.map((p, i) => `
    <article class="hub__proj-tile" data-proj="${i}">
      <button type="button" class="hub__proj-open" data-proj-open="${i}" aria-label="Open details for ${esc(p.title)}">
        <span class="hub__thumb">${thumbHtml(p)}<span class="hub__thumb-play" aria-hidden="true">&#9654;</span></span>
        <span class="hub__proj-title">${esc(p.title)}</span>
      </button>
      ${awardHtml(p, 'span')}
      ${p.role ? `<p class="hub__proj-role">${esc(p.role)}</p>` : ''}
      <p class="hub__proj-desc">${esc(p.desc)}</p>
      <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
      <div class="hub__proj-links">${projectLinks(p).map(l => linkHtml(l, 'hub__link')).join('')}</div>
    </article>`).join('');

  // Hover-to-play local demo videos
  projGrid.querySelectorAll('.hub__proj-tile').forEach(tile => {
    const vid = tile.querySelector('video[data-hover-play]');
    if (!vid) return;
    tile.addEventListener('mouseenter', () => { vid.play().catch(() => {}); });
    tile.addEventListener('mouseleave', () => { vid.pause(); });
  });

  // ----- Skills -----
  document.getElementById('hub-skills').innerHTML = SKILL_GROUPS.map(g => `
    <div class="hub__skill-group">
      <span class="hub__skill-group-name">${g.name}</span>
      <div class="hub__skill-list">${g.skills.map(([label, icon]) => {
        const iconHtml = icon
          ? `<span class="skill__icon${icon === 'postgresql' ? ' skill__icon--postgres' : ''}" style="--icon-url: url('../assets/icons/${icon}.svg')"></span>`
          : '';
        return `<span class="skill">${iconHtml}${esc(label)}</span>`;
      }).join('')}</div>
    </div>`).join('');

  document.getElementById('hub-status').textContent =
    `${EXPERIENCE.length} positions, ${projects.length} projects · Click a project for details and demo video`;

  // ----- Project detail ("Properties") panel -----
  const detail = document.getElementById('hub-detail');
  let lastOpener = null;

  function openDetail(i) {
    const p = projects[i];
    if (!p) return;
    const yt = p.mediaEmbed;
    const media = yt
      ? `<iframe class="hub__detail-media" src="${esc(yt)}" title="${esc(p.mediaText || p.title)}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : p.mediaSrc && p.mediaType === 'Video'
        ? `<video class="hub__detail-media" src="${esc(p.mediaSrc)}" controls autoplay muted loop playsinline></video>`
        : p.mediaSrc ? `<img class="hub__detail-media" src="${esc(p.mediaSrc)}" alt="${esc(p.mediaText || '')}" />` : '';
    detail.innerHTML = `
      <div class="hub__detail-titlebar">
        <span id="hub-detail-title">${esc(p.title)} Properties</span>
        <button type="button" class="window__btn window__btn--close hub__detail-close" aria-label="Close details"></button>
      </div>
      <div class="hub__detail-body">
        ${media}
        <h3 class="hub__detail-name">${esc(p.title)}</h3>
        ${awardHtml(p, 'p')}
        ${p.role ? `<p class="hub__proj-role">${esc(p.role)}</p>` : ''}
        <p class="hub__detail-desc">${esc(p.desc)}</p>
        <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
        <div class="hub__detail-actions">${projectLinks(p).map((l, j) => linkHtml(l, j === 0 ? 'hub__btn hub__btn--primary' : 'hub__btn')).join('')}</div>
      </div>`;
    detail.hidden = false;
    projGrid.querySelectorAll('.hub__proj-tile').forEach(t => t.classList.toggle('hub__proj-tile--selected', t.dataset.proj === String(i)));
    detail.querySelector('.hub__detail-close').focus();
  }

  function closeDetail() {
    if (detail.hidden) return;
    detail.hidden = true;
    detail.innerHTML = ''; // stops any playing video/iframe
    projGrid.querySelectorAll('.hub__proj-tile--selected').forEach(t => t.classList.remove('hub__proj-tile--selected'));
    lastOpener?.focus();
  }

  hubWin.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-proj-open]');
    if (opener) { lastOpener = opener; openDetail(Number(opener.dataset.projOpen)); return; }
    if (e.target.closest('.hub__detail-close')) { closeDetail(); return; }
    const winLink = e.target.closest('[data-hub-open]');
    if (winLink) { e.preventDefault(); toggleOrFocusWindow(winLink.dataset.hubOpen); return; }
    const header = e.target.closest('.explorer__sidebar-header');
    if (header) header.closest('.explorer__sidebar-section').classList.toggle('explorer__sidebar-section--collapsed');
  });

  // ----- Menu bar (File / Edit / View / Favorites / Tools / Help) -----
  const menubar = document.getElementById('hub-menubar');
  const statusEl = document.getElementById('hub-status');
  const EMAIL = 'ki3n98@gmail.com';
  const defaultStatus = statusEl ? statusEl.innerHTML : '';
  let statusTimer = null;
  const flashStatus = (msg) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.innerHTML = defaultStatus; }, 3000);
  };
  const copyText = (text, what) => {
    // Synchronous copy works inside the click gesture everywhere; async API is the fallback.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    if (ok) { flashStatus(`${what} copied to clipboard: ${text}`); return; }
    flashStatus(`${what}: ${text}`); // visible even if the async copy never settles
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => flashStatus(`${what} copied to clipboard: ${text}`),
        () => flashStatus(`${what}: ${text}`));
    } else flashStatus(`${what}: ${text}`);
  };
  const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const hubContent = document.getElementById('hub-content');
  const scrollToGroup = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top - hubContent.getBoundingClientRect().top + hubContent.scrollTop - 12;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hubContent.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Favorites = every external project link, grouped by project
  const favorites = projects.flatMap(p => projectLinks(p)
    .filter(([href]) => /^https?:/.test(href))
    .map(([href, label]) => [`${p.title} — ${label.replace(/\s*→$/, '')}`, href]));

  // [label, action] items; null = divider. Actions: open:<window>, url:<href>, or a named action.
  const MENUS = {
    File: [
      ['View Resume', 'open:resume'],
      ['Download Resume', 'download-resume'],
      null,
      ['Close', 'close'],
    ],
    Edit: [
      ['Copy Email Address', 'copy-email'],
      ['Copy Link to Portfolio', 'copy-link'],
    ],
    View: [
      ['Experience', 'goto:hub-exp-heading'],
      ['Projects', 'goto:hub-proj-heading'],
      ['Skills', 'goto:hub-skills-heading'],
      null,
      ['Task Pane', 'toggle-sidebar', 'checkable'],
      ['Status Bar', 'toggle-status', 'checkable'],
    ],
    Favorites: [
      ['GitHub', `url:${GITHUB}`],
      ['LinkedIn', `url:${LINKEDIN}`],
      null,
      ...favorites.map(([label, href]) => [label, `url:${href}`]),
    ],
    Tools: [
      ['Gradient Descent.exe', 'open:projects'],
      ['Paint', 'open:paint'],
      ['Notepad', 'open:notepad'],
      ['Calculator', 'open:calculator'],
      ['My Documents', 'open:my-documents'],
    ],
    Help: [
      ['About Kien Pham', 'open:hero'],
      ['Experience Window', 'open:experience'],
      null,
      ['Contact Me', 'open:contact'],
    ],
  };

  menubar.innerHTML = Object.entries(MENUS).map(([name, items]) => `
    <div class="notepad__menu">
      <button type="button" class="notepad__menu-item" data-hub-menu="${name}" aria-haspopup="true" aria-expanded="false">${name}</button>
      <div class="notepad__menu-dropdown" data-hub-dropdown="${name}" role="menu">
        ${items.map(it => it
          ? `<button type="button" role="menuitem" class="notepad__menu-option${it[2] ? ' notepad__menu-option--checked' : ''}" data-hub-action="${esc(it[1])}">${esc(it[0])}</button>`
          : '<div class="notepad__menu-divider"></div>').join('')}
      </div>
    </div>`).join('');

  let openMenu = null;
  const closeMenus = () => {
    menubar.querySelectorAll('.notepad__menu-dropdown.open').forEach(d => d.classList.remove('open'));
    menubar.querySelectorAll('[data-hub-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    openMenu = null;
  };
  const openMenuFor = (name) => {
    closeMenus();
    menubar.querySelector(`[data-hub-dropdown="${name}"]`).classList.add('open');
    menubar.querySelector(`[data-hub-menu="${name}"]`).setAttribute('aria-expanded', 'true');
    openMenu = name;
  };

  const runAction = (action, btn) => {
    const [kind, arg] = action.split(/:(.*)/s);
    switch (kind) {
      case 'open': toggleOrFocusWindow(arg); break;
      case 'url': openExternal(arg); break;
      case 'goto': scrollToGroup(arg); break;
      case 'download-resume': {
        const a = document.createElement('a');
        a.href = RESUME_PDF; a.download = '';
        document.body.appendChild(a); a.click(); a.remove();
        break;
      }
      case 'close': closeWindow('portfolio'); break;
      case 'copy-email': copyText(EMAIL, 'Email address'); break;
      case 'copy-link': copyText(location.href.split('#')[0], 'Portfolio link'); break;
      case 'toggle-sidebar':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-sidebar'));
        break;
      case 'toggle-status':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-status'));
        break;
    }
  };

  menubar.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('[data-hub-menu]');
    if (item) {
      const name = item.dataset.hubMenu;
      if (openMenu === name) closeMenus(); else openMenuFor(name);
      return;
    }
    const opt = e.target.closest('[data-hub-action]');
    if (opt) { closeMenus(); runAction(opt.dataset.hubAction, opt); }
  });
  menubar.addEventListener('mouseover', (e) => {
    const item = e.target.closest('[data-hub-menu]');
    if (item && openMenu && openMenu !== item.dataset.hubMenu) openMenuFor(item.dataset.hubMenu);
  });
  document.addEventListener('click', (e) => {
    if (openMenu && !menubar.contains(e.target)) closeMenus();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !openMenu) return;
    e.stopImmediatePropagation(); // Esc closes the menu, not the window
    closeMenus();
  }, true);

  // Esc closes the detail panel first instead of the whole window.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || detail.hidden || hubWin.hidden || !isTopWindow('portfolio')) return;
    e.stopImmediatePropagation();
    closeDetail();
  }, true);

  // Stop all media when the window is minimized or closed.
  new MutationObserver(() => {
    if (!hubWin.hidden) return;
    hubWin.querySelectorAll('video').forEach(v => v.pause());
    closeDetail();
  }).observe(hubWin, { attributes: true, attributeFilter: ['hidden'] });

  // Land maximized on desktop so everything is visible immediately.
  if (!isMobile() && !hubWin.hidden && !hubWin.classList.contains('window--maximized')) {
    toggleMaximize('portfolio');
  }
})();
