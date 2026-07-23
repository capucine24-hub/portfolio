export function initCaseModal(popupContent) {
  const modal = document.querySelector('.case-modal');
  const modalCard = document.querySelector('.case-modal-card');
  const modalTitle = document.querySelector('.case-modal-title');
  const modalText = document.querySelector('.case-modal-text');
  const modalMedia = document.querySelector('.case-modal-media');
  const closeButton = document.querySelector('.case-modal-close');

  if (!modal || !modalTitle || !modalText || !closeButton) return;

  modal.inert = true;

  function clearMedia() {
    if (modalMedia) {
      modalMedia.innerHTML = '';
      modalMedia.classList.remove('has-two-images');
    }

    if (modalCard) {
      modalCard.classList.remove('has-media');
    }
  }

  function closeModal() {
    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;

    clearMedia();
  }

  document.querySelectorAll('.popup-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      const content = popupContent[button.dataset.popup];
      if (!content) return;

      modalTitle.textContent = content.title || '';
      modalText.textContent = content.text || '';

      clearMedia();

      if (modalMedia && content.images && content.images.length > 0) {
        modalCard.classList.add('has-media');

        if (content.images.length > 1) {
          modalMedia.classList.add('has-two-images');
        }

        content.images.forEach((imagePath) => {
          const image = document.createElement('img');
          image.src = imagePath;
          image.alt = content.title || '';
          modalMedia.appendChild(image);
        });
      }

      modal.inert = false;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}