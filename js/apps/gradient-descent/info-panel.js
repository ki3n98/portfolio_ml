// Project info panel next to the curve: media, links, and the fade-swap on step change.

import { PROJECTS, N, infoPanel, infoStep, infoTitle, infoAward, infoDesc, infoTags, infoLink, infoSecondaryLink, infoTertiaryLink, infoGradient, infoMedia, infoMediaVideo, infoMediaImg, infoMediaEmbed, infoMediaType, infoMediaText, S } from './state.js';
import { fPrime } from './math.js';

function updateMediaPanel(proj) {
  infoMedia.hidden = !!proj.hideMedia;
  infoMedia.classList.toggle('is-hidden', !!proj.hideMedia);
  infoMedia.dataset.type = (proj.mediaType || 'image').toLowerCase();

  const isImage = (proj.mediaType || '').toLowerCase() === 'image' && proj.mediaSrc;
  infoMedia.dataset.hasVideo = (!isImage && proj.mediaSrc) ? 'true' : 'false';
  infoMedia.dataset.hasEmbed = proj.mediaEmbed ? 'true' : 'false';
  infoMedia.dataset.hasImage = isImage ? 'true' : 'false';
  infoMediaType.textContent = proj.mediaType || 'Image';
  infoMediaText.textContent = proj.mediaText || 'Project media placeholder';

  if (proj.mediaEmbed) {
    infoMediaVideo.pause();
    infoMediaVideo.removeAttribute('src');
    infoMediaVideo.load();
    if (infoMediaEmbed.getAttribute('src') !== proj.mediaEmbed) {
      infoMediaEmbed.src = proj.mediaEmbed;
    }
    infoMediaEmbed.title = proj.title + ' demo';
  } else {
    infoMediaEmbed.removeAttribute('src');
    infoMediaEmbed.title = '';
  }

  if (isImage) {
    infoMediaImg.src = proj.mediaSrc;
    infoMediaImg.alt = proj.mediaText || proj.title;
    infoMediaVideo.pause();
    infoMediaVideo.removeAttribute('src');
    infoMediaVideo.load();
  } else if (proj.mediaSrc) {
    infoMediaImg.removeAttribute('src');
    infoMediaEmbed.removeAttribute('src');
    infoMediaEmbed.title = '';
    if (infoMediaVideo.getAttribute('src') !== proj.mediaSrc) {
      infoMediaVideo.src = proj.mediaSrc;
      infoMediaVideo.load();
    }
    infoMediaVideo.play().catch(() => {});
  } else {
    infoMediaImg.removeAttribute('src');
    infoMediaVideo.pause();
    infoMediaVideo.removeAttribute('src');
    infoMediaVideo.load();
  }
}

function updateLinks(proj) {
  infoLink.href = proj.link;
  const isExternalLink = /^https?:\/\//i.test(proj.link || '');
  infoLink.target = isExternalLink ? '_blank' : '';
  infoLink.rel = isExternalLink ? 'noopener noreferrer' : '';
  infoLink.textContent = proj.ctaLabel || 'View Project →';

  infoSecondaryLink.hidden = !proj.secondaryLink;
  infoSecondaryLink.classList.toggle('is-hidden', !proj.secondaryLink);
  if (proj.secondaryLink) {
    infoSecondaryLink.href = proj.secondaryLink;
    infoSecondaryLink.textContent = proj.secondaryLabel || 'Learn More';
    if (proj.secondaryLink.match(/\.(pdf|zip|tar|gz)$/i)) {
      infoSecondaryLink.setAttribute('download', '');
    } else {
      infoSecondaryLink.removeAttribute('download');
    }
    const isExternal = /^https?:\/\//i.test(proj.secondaryLink);
    infoSecondaryLink.target = isExternal ? '_blank' : '';
    infoSecondaryLink.rel = isExternal ? 'noopener noreferrer' : '';
  } else {
    infoSecondaryLink.removeAttribute('href');
    infoSecondaryLink.removeAttribute('download');
  }

  infoTertiaryLink.hidden = !proj.tertiaryLink;
  infoTertiaryLink.classList.toggle('is-hidden', !proj.tertiaryLink);
  if (proj.tertiaryLink) {
    infoTertiaryLink.href = proj.tertiaryLink;
    infoTertiaryLink.textContent = proj.tertiaryLabel || 'Learn More';
    const isExternalTertiary = /^https?:\/\//i.test(proj.tertiaryLink);
    infoTertiaryLink.target = isExternalTertiary ? '_blank' : '';
    infoTertiaryLink.rel = isExternalTertiary ? 'noopener noreferrer' : '';
  } else {
    infoTertiaryLink.removeAttribute('href');
  }
}

export function updateInfo(idx) {
  if (S.infoSwapTimer) {
    clearTimeout(S.infoSwapTimer);
    S.infoSwapTimer = null;
  }

  if (idx < 0 || idx >= N) {
    infoPanel.classList.remove('active');
    S.currentInfoIdx = -1;
    return;
  }
  if (idx === S.currentInfoIdx) return;
  S.currentInfoIdx = idx;

  // Fade out, swap content, fade in
  infoPanel.classList.remove('active');

  S.infoSwapTimer = setTimeout(() => {
    const proj = PROJECTS[idx];
    const slope = fPrime(proj.x);

    infoStep.textContent = proj.step;
    infoGradient.textContent = '\u2207 = ' + slope.toFixed(2);
    infoTitle.textContent = proj.title;
    infoAward.textContent = proj.award || '';
    infoAward.hidden = !proj.award;
    infoAward.classList.toggle('is-hidden', !proj.award);
    infoDesc.textContent = proj.desc;

    updateMediaPanel(proj);

    infoTags.innerHTML = proj.tags.map(t =>
      '<span class="tag">' + t + '</span>'
    ).join('');

    updateLinks(proj);

    // Progress bar
    infoPanel.style.setProperty('--gd-progress', ((idx + 1) / N * 100) + '%');
    void infoPanel.offsetHeight;
    infoPanel.classList.add('active');
    S.infoSwapTimer = null;
  }, 250);
}
