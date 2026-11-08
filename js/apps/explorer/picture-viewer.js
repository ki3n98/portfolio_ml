// Picture viewer dialog (opened from My Pictures) and the slideshow task.

let pictureViewerEl = null;
let slideshowTimer = null;

function stopSlideshow() {
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
}

export function startSlideshow(images) {
  if (!images.length) return;
  stopSlideshow();
  let i = 0;
  openPictureViewer(images[i].src, images[i].label);
  slideshowTimer = setInterval(() => {
    i = (i + 1) % images.length;
    openPictureViewer(images[i].src, images[i].label);
  }, 2500);
}

function closePictureViewer() {
  stopSlideshow();
  pictureViewerEl?.classList.remove('open');
}

export function openPictureViewer(src, label) {
  if (!pictureViewerEl) {
    pictureViewerEl = document.createElement('div');
    pictureViewerEl.className = 'picture-viewer';
    pictureViewerEl.innerHTML = `
      <div class="picture-viewer__dialog">
        <div class="picture-viewer__titlebar">
          <span class="picture-viewer__title"></span>
          <button type="button" class="picture-viewer__close" aria-label="Close">&times;</button>
        </div>
        <div class="picture-viewer__body">
          <img class="picture-viewer__img" alt="">
        </div>
      </div>
    `;
    document.body.appendChild(pictureViewerEl);
    pictureViewerEl.querySelector('.picture-viewer__close').addEventListener('click', closePictureViewer);
    pictureViewerEl.addEventListener('click', (e) => {
      if (e.target === pictureViewerEl) closePictureViewer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePictureViewer();
    });
  }
  pictureViewerEl.querySelector('.picture-viewer__title').textContent = label;
  const img = pictureViewerEl.querySelector('.picture-viewer__img');
  img.src = src;
  img.alt = label;
  pictureViewerEl.classList.add('open');
}
