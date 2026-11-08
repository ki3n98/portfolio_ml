// Portfolio Hub shared constants and HTML helpers (used by index.js and menubar.js).

import { escapeHtml } from '../../utils.js';
import { PORTFOLIO_PROJECTS } from '../../data/projects.js';

export const RESUME_PDF = 'assets/resume/Kien_Pham_resume.pdf';
export const GITHUB = 'https://github.com/ki3n98';
export const LINKEDIN = 'https://www.linkedin.com/in/kien-t-pham/';

export const projects = PORTFOLIO_PROJECTS.filter(p => p.includeInOverview !== false);
export const isWin = (p) => /best|award/i.test(p.award || '');
export const awardHtml = (p, tag) => p.award
  ? `<${tag} class="hub__award${isWin(p) ? ' hub__award--win' : ''}">${isWin(p) ? '🏆 ' : ''}${escapeHtml(p.award)}</${tag}>`
  : '';

export const isExternal = (url) => /^https?:/.test(url);
export const youtubeId = (url) => (url && url.match(/embed\/([\w-]+)/) || [])[1];

export function projectLinks(p) {
  return [
    [p.link, (p.ctaLabel || 'View Project →').replace(/\s*→$/, '')],
    [p.secondaryLink, p.secondaryLabel],
    [p.tertiaryLink, p.tertiaryLabel],
  ].filter(([url]) => url);
}

export function linkHtml([url, label], cls) {
  const ext = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="${cls}" href="${escapeHtml(url)}"${ext}>${escapeHtml(label)}</a>`;
}

export function thumbHtml(p) {
  if (p.mediaSrc && p.mediaType === 'Video') {
    return `<video class="hub__thumb-media" src="${escapeHtml(p.mediaSrc)}#t=1" muted loop playsinline preload="metadata" data-hover-play></video>`;
  }
  const yt = youtubeId(p.mediaEmbed);
  if (yt) return `<img class="hub__thumb-media" src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy" />`;
  if (p.mediaSrc) return `<img class="hub__thumb-media" src="${escapeHtml(p.mediaSrc)}" alt="" loading="lazy" />`;
  return '';
}
