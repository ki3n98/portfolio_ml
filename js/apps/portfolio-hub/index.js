// Portfolio Hub ("C:\Kien Pham" Explorer window): the recruiter-facing landing view —
// bio, experience, projects and skills all visible at once, every external link one click away.

import { escapeHtml, isMobile } from '../../utils.js';
import { isTopWindow, toggleMaximize, toggleOrFocusWindow } from '../../desktop/window-manager.js';
import { PORTFOLIO_EXPERIENCE } from '../../data/experience.js';
import { SKILL_GROUPS } from '../../data/skills.js';
import { projectLinks, linkHtml, thumbHtml, RESUME_PDF, GITHUB, LINKEDIN, projects, isWin, awardHtml } from './shared.js';
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
        return `<span class="skill">${iconHtml}${escapeHtml(label)}</span>`;
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
      ? `<iframe class="hub__detail-media" src="${escapeHtml(yt)}" title="${escapeHtml(p.mediaText || p.title)}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : p.mediaSrc && p.mediaType === 'Video'
        ? `<video class="hub__detail-media" src="${escapeHtml(p.mediaSrc)}" controls autoplay muted loop playsinline></video>`
        : p.mediaSrc ? `<img class="hub__detail-media" src="${escapeHtml(p.mediaSrc)}" alt="${escapeHtml(p.mediaText || '')}" />` : '';
    detail.innerHTML = `
      <div class="hub__detail-titlebar">
        <span id="hub-detail-title">${escapeHtml(p.title)} Properties</span>
        <button type="button" class="window__btn window__btn--close hub__detail-close" aria-label="Close details"></button>
      </div>
      <div class="hub__detail-body">
        ${media}
        <h3 class="hub__detail-name">${escapeHtml(p.title)}</h3>
        ${awardHtml(p, 'p')}
        ${p.role ? `<p class="hub__proj-role">${escapeHtml(p.role)}</p>` : ''}
        <p class="hub__detail-desc">${escapeHtml(p.desc)}</p>
        <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${escapeHtml(t)}</span>`).join('')}</div>
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

  initHubMenubar(hubWin);

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
}
