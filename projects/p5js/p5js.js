const tabs = document.querySelectorAll('.sketch-tab');
const iframe = document.querySelector('.sketch-iframe');
const captionTitle = document.querySelector('.sketch-caption h3');
const captionText = document.querySelector('.sketch-caption p');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');

    iframe.src = tab.dataset.src;
    iframe.title = tab.dataset.title;

    captionTitle.textContent = tab.dataset.title;
    captionText.textContent = tab.dataset.description;
  });
});
