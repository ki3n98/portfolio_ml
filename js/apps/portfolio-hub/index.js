// Portfolio Hub ("C:\Kien Pham" Explorer window): the recruiter-facing landing view —
// bio, experience, projects and skills all visible at once, every external link one click away.

import { escapeHtml, isMobile } from '../../utils.js';
import { isTopWindow, toggleMaximize, toggleOrFocusWindow } from '../../desktop/window-manager.js';
import { PORTFOLIO_EXPERIENCE } from '../../data/experience.js';
import { SKILL_GROUPS } from '../../data/skills.js';
import { projectLinks, linkHtml, thumbHtml, RESUME_PDF, GITHUB, LINKEDIN, projects, isWin, awardHtml, isExternal } from './shared.js';
import { initHubMenubar } from './menubar.js';

export function initPortfolioHub() {
  const hubWin = document.getElementById('window-portfolio');
  if (!hubWin) return;

  const EXPERIENCE = PORTFOLIO_EXPERIENCE;

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
    + `<span><span class="hub__highlight-big">${escapeHtml(big)}</span><span class="hub__highlight-small">${escapeHtml(small)}</span></span></div>`).join('');

  // ----- Experience -----
  document.getElementById('hub-exp-heading').textContent = `Experience (${EXPERIENCE.length})`;
  document.getElementById('hub-exp').innerHTML = EXPERIENCE.map(e => {
    return `<article class="hub__exp-tile">
      <span class="hub__exp-icon" style="--icon-url: url('${e.icon}')" aria-hidden="true"></span>
      <div class="hub__exp-main">
        <div class="hub__exp-head">
          <h3 class="hub__exp-org">${escapeHtml(e.org)}</h3>
          <span class="hub__exp-dates">${escapeHtml(e.dates)}</span>
        </div>
        <p class="hub__exp-role">${escapeHtml(e.role)}</p>
        ${e.context ? `<p class="hub__exp-context">${escapeHtml(e.context)}</p>` : ''}
        <ul class="hub__exp-list-items">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <div class="hub__tags">${e.tags.map(t => `<span class="hub__tag">${escapeHtml(t)}</span>`).join('')}</div>
        ${e.links ? `<div class="hub__proj-links">${e.links.map(l => linkHtml(l, 'hub__link')).join('')}</div>` : ''}
      </div>
    </article>`;
  }).join('');

  // ----- Projects -----
  document.getElementById('hub-proj-heading').textContent = `Projects (${projects.length})`;
  const projGrid = document.getElementById('hub-proj');
  projGrid.innerHTML = projects.map((p, i) => `
    <article class="hub__proj-tile" data-proj="${i}">
      <button type="button" class="hub__proj-open" data-proj-open="${i}" aria-label="Open details for ${escapeHtml(p.title)}">
        <span class="hub__thumb">${thumbHtml(p)}<span class="hub__thumb-play" aria-hidden="true">&#9654;</span></span>
        <span class="hub__proj-title">${escapeHtml(p.title)}</span>
      </button>
      ${awardHtml(p, 'span')}
      ${p.role ? `<p class="hub__proj-role">${escapeHtml(p.role)}</p>` : ''}
      <p class="hub__proj-desc">${escapeHtml(p.desc)}</p>
      <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="hub__proj-links">${projectLinks(p).map(l => linkHtml(l, 'hub__link hub__proj-link')).join('')}</div>
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
        return `<span class="skill">${iconHtml}${escapeHtml(label)}</span>`;
      }).join('')}</div>
    </div>`).join('');

  document.getElementById('hub-status').textContent =
    `${EXPERIENCE.length} positions, ${projects.length} projects · Click a project for details and demo video`;

  // ----- Project detail page + Back/Forward history -----
  const detail = document.getElementById('hub-detail');
  const projectPage = document.getElementById('hub-project-page');
  const addrTextEl = hubWin.querySelector('[data-hub-address-text]');
  const backBtn = hubWin.querySelector('[data-hub-back]');
  const fwdBtn = hubWin.querySelector('[data-hub-forward]');
  const HUB_PATH = 'C:\\Kien Pham';
  const LANDING = { view: 'landing' };
  let lastOpener = null;

  // History tracks detail open/close only — menu-bar View scrolling never enters.
  // Same shape as js/apps/explorer/index.js history, kept local to avoid importing explorer.
  let history = [LANDING];
  let historyIndex = 0;

  function renderDetail(i) {
    const p = projects[i];
    const yt = p.mediaEmbed;
    const media = yt
      ? `<iframe class="hub__project-media" src="${escapeHtml(yt)}" title="${escapeHtml(p.mediaText || p.title)}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : p.mediaSrc && p.mediaType === 'Video'
        ? `<video class="hub__project-media" src="${escapeHtml(p.mediaSrc)}" controls autoplay muted loop playsinline></video>`
        : p.mediaSrc ? `<img class="hub__project-media" src="${escapeHtml(p.mediaSrc)}" alt="${escapeHtml(p.mediaText || '')}" />` : '';

    // Render project detail page (full screen replacement)
    const titleEl = projectPage.querySelector('#hub-project-page-title');
    titleEl.textContent = escapeHtml(p.title);

    const roleEl = projectPage.querySelector('#hub-project-page-role');
    roleEl.textContent = p.role ? escapeHtml(p.role) : '';

    const awardEl = projectPage.querySelector('#hub-project-page-award');
    awardEl.textContent = awardHtml(p, 'span');
    awardEl.hidden = !p.award;

    const mediaEl = projectPage.querySelector('#hub-project-page-media');
    mediaEl.innerHTML = media;

    const descEl = projectPage.querySelector('#hub-project-page-desc');
    descEl.textContent = escapeHtml(p.desc);

    const tagsEl = projectPage.querySelector('#hub-project-page-tags');
    tagsEl.innerHTML = p.tags.map(t => `<span class="hub__project-tag">${escapeHtml(t)}</span>`).join('');

    const actionsEl = projectPage.querySelector('#hub-project-page-actions');
    const links = projectLinks(p);
    actionsEl.innerHTML = links.map((l, j) => {
      const ext = isExternal(l[0]) ? ' target="_blank" rel="noopener noreferrer"' : '';
      const btnClass = j === 0 ? 'hub__project-btn hub__project-btn--primary' : 'hub__project-btn hub__project-btn--secondary';
      return `<a class="${btnClass}" href="${escapeHtml(l[0])}"${ext}>${escapeHtml(l[1])}</a>`;
    }).join('');

    detail.hidden = true;
    projectPage.hidden = false;

    projGrid.querySelectorAll('.hub__proj-tile').forEach(t => t.classList.toggle('hub__proj-tile--selected', t.dataset.proj === String(i)));
    titleEl.focus();
  }

  function hideDetail() {
    if (projectPage.hidden && detail.hidden) return;
    
    // Stop all media in both detail views
    hubWin.querySelectorAll('video').forEach(v => v.pause());
    hubWin.querySelectorAll('iframe').forEach(i => i.src = '');
    
    projectPage.hidden = true;
    detail.hidden = true;
    detail.innerHTML = ''; // stops any playing video/iframe
    
    projGrid.querySelectorAll('.hub__proj-tile--selected').forEach(t => t.classList.remove('hub__proj-tile--selected'));
    
    addrTextEl.textContent = HUB_PATH;
    backBtn.disabled = true;
    fwdBtn.disabled = true;
    
    lastOpener?.focus();
  }

  // Renders the state for one history entry (detail open or landing) and syncs
  // the address bar and nav buttons to it. Does not touch the history itself.
  function applyEntry(entry) {
    const projectId = entry.view === 'detail' ? entry.projectId : -1;
    if (projects[projectId]) {
      renderDetail(projectId);
      // textContent (not innerHTML) so project titles can't inject markup.
      addrTextEl.textContent = `${HUB_PATH}\\Projects\\${projects[projectId].title}`;
      // Update nav buttons for project page
      backBtn.disabled = historyIndex <= 0;
      fwdBtn.disabled = historyIndex >= history.length - 1;
    } else {
      hideDetail();
      addrTextEl.textContent = HUB_PATH;
      backBtn.disabled = true;
      fwdBtn.disabled = true;
    }
  }

  // Records a new location (like explorer's navigate()): drop any forward branch,
  // append, and render. Used by user navigation; window-hide must not call this.
  function pushEntry(entry) {
    if (entry.view === 'detail' && !projects[entry.projectId]) return;
    // Adjacent duplicate (e.g. double-clicking a project tile) is not a move:
    // skip the push so one Back press still leaves the detail.
    const current = history[historyIndex];
    if (current.view === entry.view && current.projectId === entry.projectId) return;
    history = history.slice(0, historyIndex + 1);
    history.push(entry);
    historyIndex = history.length - 1;
    applyEntry(entry);
  }

  hubWin.addEventListener('click', (e) => {
    // Click on a project tile to open details, unless it's a link inside the tile
    const tile = e.target.closest('.hub__proj-tile');
    if (tile) {
      // Check if click originated from a link inside the tile
      const link = e.target.closest('.hub__proj-link');
      if (!link) {
        const opener = tile.querySelector('[data-proj-open]');
        if (opener) { lastOpener = opener; pushEntry({ view: 'detail', projectId: Number(tile.dataset.proj) }); return; }
      }
      return;
    }
    if (e.target.closest('.hub__detail-close')) { pushEntry(LANDING); return; }
    if (e.target.closest('[data-hub-back-to-grid]')) { pushEntry(LANDING); return; }
    const winLink = e.target.closest('[data-hub-open]');
    if (winLink) { e.preventDefault(); toggleOrFocusWindow(winLink.dataset.hubOpen); return; }
    const header = e.target.closest('.explorer__sidebar-header');
    if (header) header.closest('.explorer__sidebar-section').classList.toggle('explorer__sidebar-section--collapsed');
  });

  backBtn.addEventListener('click', () => {
    if (historyIndex <= 0) return;
    historyIndex--;
    applyEntry(history[historyIndex]);
  });
  fwdBtn.addEventListener('click', () => {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    applyEntry(history[historyIndex]);
  });

  initHubMenubar(hubWin);

  // Esc closes the detail panel / project page first instead of the whole window.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || (detail.hidden && projectPage.hidden) || hubWin.hidden || !isTopWindow('portfolio')) return;
    e.stopImmediatePropagation();
    pushEntry(LANDING);
  }, true);

  // Stop all media when the window is minimized or closed. Hiding the window is
  // not navigation, so this hides the detail bare instead of pushing a history
  // entry; on restore, applyEntry re-renders the real history position (the bare
  // hide above left the view on the landing page). applyEntry never touches
  // hubWin.hidden, so this cannot loop.
  new MutationObserver(() => {
    if (!hubWin.hidden) {
      applyEntry(history[historyIndex]);
      return;
    }
    hubWin.querySelectorAll('video').forEach(v => v.pause());
    hideDetail();
    addrTextEl.textContent = HUB_PATH;
  }).observe(hubWin, { attributes: true, attributeFilter: ['hidden'] });

  // Closing (X button) resets navigation history; minimizing does not.
  hubWin.addEventListener('windowclosed', () => {
    history = [LANDING];
    historyIndex = 0;
    applyEntry(LANDING);
  });

  // Land maximized on desktop so everything is visible immediately.
  if (!isMobile() && !hubWin.hidden && !hubWin.classList.contains('window--maximized')) {
    toggleMaximize('portfolio');
  }
}
