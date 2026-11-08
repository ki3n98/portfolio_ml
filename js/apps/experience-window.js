// Experience window: renders cards from data/experience.js.

import { escapeHtml } from '../utils.js';
import { PORTFOLIO_EXPERIENCE } from '../data/experience.js';

export function initExperienceWindow() {
  const list = document.getElementById('experience-list');
  if (!list) return;
  list.innerHTML = PORTFOLIO_EXPERIENCE.map(e => `
    <article class="experience-card fade-in">
      <div class="experience-card__header">
        <div>
          <h3 class="experience-card__title">${escapeHtml(e.org)}</h3>
          <p class="experience-card__role">${escapeHtml(e.role)}</p>
        </div>
        <span class="experience-card__date">${escapeHtml(e.dates)}</span>
      </div>
      ${e.context ? `<p class="experience-card__context">${escapeHtml(e.context)}</p>` : ''}
      <ul class="experience-card__list">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      <div class="experience-card__tags">${e.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      ${e.links ? `<div class="experience-card__links">${e.links.map(([url, label]) =>
        `<a href="${escapeHtml(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(label)}</a>`).join('')}</div>` : ''}
    </article>`).join('');
}
